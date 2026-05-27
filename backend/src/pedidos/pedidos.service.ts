import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { LineaPedido } from '../linea-pedido/entities/linea-pedido.entity';
import { Carrito } from '../carrito/entities/carrito.entity';
import { LineaCarrito } from '../linea-carrito/entities/linea-carrito.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Combo } from '../combos/entities/combo.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { EnviosService } from '../envios/envios.service';
import { CuponesService } from '../cupones/cupones.service';
import { MailService } from './mail.service';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

export function extraerCP(direccion: string): string {
  if (!direccion) return '0000';
  const cpMatch = direccion.match(/(?:CP|C\.P\.)\s*([A-Z]?\d{4}[A-Z]{0,3})/i);
  if (cpMatch) {
    const digits = cpMatch[1].match(/(\d{4})/);
    return digits ? digits[1] : cpMatch[1];
  }
  const endMatch = direccion.match(/,\s*([A-Z]?\d{4}[A-Z]{0,3})\s*$/i);
  if (endMatch) {
    const digits = endMatch[1].match(/(\d{4})/);
    return digits ? digits[1] : endMatch[1];
  }
  const generalMatch = direccion.match(/\b\d{4}\b/);
  if (generalMatch) {
    return generalMatch[0];
  }
  return '0000';
}

export function calcularCostoEnvio(cp: string): number {
  if (!cp || cp === '0000') return 1500;
  const cpNumerico = cp.replace(/\D/g, '');
  if (cpNumerico === '3260') {
    return 0;
  }
  const cpInt = parseInt(cpNumerico, 10);
  if (isNaN(cpInt) || cpNumerico.length !== 4) {
    return 1500;
  }
  if (cpNumerico.startsWith('31') || cpNumerico.startsWith('32')) {
    return 800; // Entre Ríos
  }
  if (cpNumerico.startsWith('3')) {
    return 1200; // Litoral / Norte
  }
  if (cpNumerico.startsWith('1') || cpNumerico.startsWith('2')) {
    return 1500; // Buenos Aires y CABA
  }
  if (cpNumerico.startsWith('4') || cpNumerico.startsWith('5')) {
    return 2000; // Centro / Cuyo / NOA
  }
  if (cpNumerico.startsWith('8') || cpNumerico.startsWith('9')) {
    return 2800; // Patagonia
  }
  return 1500;
}

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido) private pedidoRepository: Repository<Pedido>,
    @InjectRepository(LineaPedido) private lineaPedidoRepository: Repository<LineaPedido>,
    @InjectRepository(Carrito) private carritoRepository: Repository<Carrito>,
    @InjectRepository(LineaCarrito) private lineaCarritoRepository: Repository<LineaCarrito>,
    @InjectRepository(Producto) private productoRepository: Repository<Producto>,
    @InjectRepository(Combo) private comboRepository: Repository<Combo>,
    private usuariosService: UsuariosService,
    private enviosService: EnviosService,
    private cuponesService: CuponesService,
    private mailService: MailService,
  ) {
    // Inicializar Mercado Pago con el Access Token
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000'
    });
    this.mercadoPagoClient = client;
  }

  private mercadoPagoClient: MercadoPagoConfig;

  async crearPreferencia(idUsuario: string, codigoCupon?: string, direccionEnvio?: string) {
    // 1. Buscamos el carrito del usuario
    const carrito = await this.carritoRepository.findOne({
      where: { usuario: { idUsuario } },
      relations: ['lineas', 'lineas.producto', 'lineas.producto.tema', 'lineas.combo', 'lineas.combo.productos', 'lineas.combo.productos.tema'],
    });

    if (!carrito || !carrito.lineas || carrito.lineas.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    // 2. Calcular el total final
    let totalFinal = Number(carrito.totalConDescuento || carrito.total);

    if (codigoCupon) {
      try {
        const temasEnCarrito: number[] = [];
        carrito.lineas.forEach(linea => {
          if (linea.producto) {
            if (linea.producto.tema) {
              temasEnCarrito.push(linea.producto.tema.idTema);
            } else {
              temasEnCarrito.push(-1); // Sin temática
            }
          }
          if (linea.combo && linea.combo.productos) {
            linea.combo.productos.forEach(p => { 
              if (p.tema) {
                temasEnCarrito.push(p.tema.idTema);
              } else {
                temasEnCarrito.push(-1); // Sin temática
              }
            });
          }
        });

        const cupon = await this.cuponesService.validate(codigoCupon, carrito.total, temasEnCarrito, idUsuario);
        const descuentoCupon = totalFinal * (Number(cupon.porcentaje) / 100);
        totalFinal = totalFinal - descuentoCupon;
      } catch (e) {
        console.error('Error al aplicar cupón en MP:', e);
        // Si el cupón falla, podríamos lanzar un error o ignorarlo.
        throw new BadRequestException(e.message || 'El cupón no es válido.');
      }
    }

    // Calcular costo de envío según el CP
    let costoEnvio = 0;
    if (direccionEnvio) {
      const cp = extraerCP(direccionEnvio);
      costoEnvio = calcularCostoEnvio(cp);
    }
    const totalConEnvio = totalFinal + costoEnvio;

    // Redondeamos a 2 decimales para evitar errores de validación en Mercado Pago
    const totalFinalRedondeado = Number(totalConEnvio.toFixed(2));

    // 3. Mapeamos todo a un solo item consolidado para que el total coincida exactamente
    const items = [{
      id: `PEDIDO-${carrito.idCarrito}`,
      title: 'Compra en Bloque Mundo',
      quantity: 1,
      unit_price: totalFinalRedondeado,
      currency_id: 'ARS',
    }];

    // 3. Creamos la preferencia
    const preference = new Preference(this.mercadoPagoClient);

    // --- CAMBIO PARA EVITAR ERROR FATAL ---
    // 1. Creamos la orden en estado PENDIENTE antes de ir a MP
    // Esto hace que aparezca en la DB, pero no resta stock ni vacía el carrito
    const pedidoPendiente = await this.crearPedidoPendiente(idUsuario, codigoCupon, direccionEnvio);

    // Usamos el link de ngrok como puente (bridge) para que Mercado Pago acepte el auto_return (que requiere HTTPS)
    const bridgeUrl = (process.env.WEBHOOK_URL || '').replace('/webhook', '/retorno');
    const bridgeParams = `?idPedido=${(pedidoPendiente as any).idPedido}`;

    try {
      const response = await preference.create({
        body: {
          items: items,
          back_urls: {
            success: bridgeUrl ? `${bridgeUrl}${bridgeParams}&status=success` : `http://localhost:5173/perfil/compras?status=success&idPedido=${(pedidoPendiente as any).idPedido}`,
            failure: bridgeUrl ? `${bridgeUrl}${bridgeParams}&status=failure` : `http://localhost:5173/perfil/compras?status=failure&idPedido=${(pedidoPendiente as any).idPedido}`,
            pending: bridgeUrl ? `${bridgeUrl}${bridgeParams}&status=success` : `http://localhost:5173/perfil/compras?status=success&idPedido=${(pedidoPendiente as any).idPedido}`,
          },
          auto_return: 'approved',
          external_reference: (pedidoPendiente as any).idPedido.toString(), 
          notification_url: process.env.WEBHOOK_URL,
          metadata: {
            id_pedido: (pedidoPendiente as any).idPedido,
            id_usuario: idUsuario,
            codigo_cupon: codigoCupon || null
          }
        }
      });

      return {
        id: response.id,
        init_point: response.init_point,
      };
    } catch (error) {
      console.error('Error al crear preferencia de Mercado Pago:', error);
      throw new BadRequestException('Error al comunicarse con Mercado Pago');
    }
  }

  async crearPedidoPendiente(idUsuario: string, codigoCupon?: string, direccionEnvio?: string) {
    const carrito = await this.carritoRepository.findOne({
      where: { usuario: { idUsuario } },
      relations: ['lineas', 'lineas.producto', 'lineas.producto.tema', 'lineas.combo', 'lineas.combo.productos', 'lineas.combo.productos.tema', 'usuario', 'usuario.nivel'],
    });

    if (!carrito || !carrito.lineas || carrito.lineas.length === 0) {
      throw new BadRequestException('Carrito vacío');
    }

    // Validar Precios
    let precioCambiado = false;
    let errorDetalle: any = null;

    for (const linea of carrito.lineas) {
      const item = linea.producto || linea.combo;
      if (!item) continue;
      
      const isCombo = !!linea.combo;
      const idStr = isCombo ? `combo-${linea.combo.idCombo}` : linea.producto.idProducto.toString();
      const titulo = isCombo ? linea.combo.titulo : linea.producto.titulo;
      const precioDB = Number(item.precio);
      const precioCarrito = Number(linea.precioUnitario);

      if (precioCarrito !== precioDB) {
        linea.precioUnitario = precioDB;
        await this.lineaCarritoRepository.save(linea);
        precioCambiado = true;

        if (!errorDetalle) {
          errorDetalle = {
            message: `El precio de "${titulo}" fue actualizado. (Antes: $${precioCarrito}, Ahora: $${precioDB}).`,
            errorType: 'PRICE_ERROR',
            productoId: idStr,
            titulo: titulo,
            oldPrice: precioCarrito,
            newPrice: precioDB
          };
        }
      }
    }

    if (precioCambiado) {
      const lineasActualizadas = await this.lineaCarritoRepository.find({ where: { carrito: { idCarrito: carrito.idCarrito } } });
      const totalBruto = lineasActualizadas.reduce((acc, l) => acc + (Number(l.precioUnitario) * l.cantidad), 0);
      carrito.total = totalBruto;
      
      const porcentaje = Number(carrito.usuario?.nivel?.porcentajeDescuento || 0);
      carrito.descuentoAplicado = totalBruto * (porcentaje / 100);
      carrito.totalConDescuento = totalBruto - carrito.descuentoAplicado;
      
      await this.carritoRepository.save(carrito);

      throw new BadRequestException(errorDetalle);
    }

    // Validar Stock
    const demandaProductos = new Map<number, { 
      titulo: string; 
      solicitada: number; 
      stockActual: number; 
      combosInvolucrados: Set<string>; 
    }>();

    for (const linea of carrito.lineas) {
      const cant = Number(linea.cantidad) || 0;
      if (linea.producto) {
        const prod = linea.producto;
        const stockActual = Number(prod.stock) || 0;
        const actual = demandaProductos.get(prod.idProducto) || { 
          titulo: prod.titulo, 
          solicitada: 0, 
          stockActual: stockActual, 
          combosInvolucrados: new Set<string>() 
        };
        actual.solicitada += cant;
        demandaProductos.set(prod.idProducto, actual);
      } else if (linea.combo) {
        const comboCompleto = await this.comboRepository.findOne({ 
          where: { idCombo: linea.combo.idCombo }, 
          relations: ['productos'] 
        });
        if (comboCompleto && comboCompleto.productos) {
          for (const p of comboCompleto.productos) {
            const stockActual = Number(p.stock) || 0;
            const actual = demandaProductos.get(p.idProducto) || { 
              titulo: p.titulo, 
              solicitada: 0, 
              stockActual: stockActual, 
              combosInvolucrados: new Set<string>() 
            };
            actual.solicitada += cant;
            actual.combosInvolucrados.add(comboCompleto.titulo);
            demandaProductos.set(p.idProducto, actual);
          }
        }
      }
    }

    // Console log para ver la validacion internamente en el backend
    console.log("Validando stock para checkout:", Array.from(demandaProductos.values()));

    for (const [id, info] of demandaProductos.entries()) {
      if (info.solicitada > info.stockActual) {
        console.warn(`Stock insuficiente detectado: ${info.titulo} - Solicitada: ${info.solicitada}, Stock: ${info.stockActual}`);
        
        let comboSuffix = '';
        if (info.combosInvolucrados.size > 0) {
          const list = Array.from(info.combosInvolucrados).map(c => `"${c}"`).join(', ');
          comboSuffix = info.combosInvolucrados.size === 1
            ? ` (incluido en el combo ${list})`
            : ` (incluido en los combos ${list})`;
        }

        const messageText = info.stockActual === 0 
          ? `El producto "${info.titulo}"${comboSuffix} no tiene stock suficiente (Solicitaste ${info.solicitada}, pero no queda stock).`
          : `El producto "${info.titulo}"${comboSuffix} no tiene stock suficiente (Solicitaste ${info.solicitada}, pero quedan ${info.stockActual} disponibles).`;

        throw new BadRequestException({
          message: messageText,
          errorType: 'STOCK_ERROR',
          productoId: id,
          stockActual: info.stockActual,
          solicitada: info.solicitada
        });
      }
    }

    let totalFinal = Number(carrito.totalConDescuento || carrito.total);
    let cuponEntidad: any = null;

    if (codigoCupon) {
      try {
        const temasEnCarrito: number[] = [];
        carrito.lineas.forEach(linea => {
          if (linea.producto) {
            if (linea.producto.tema) {
              temasEnCarrito.push(linea.producto.tema.idTema);
            } else {
              temasEnCarrito.push(-1); // Sin temática
            }
          }
          if (linea.combo && linea.combo.productos) {
            linea.combo.productos.forEach(p => { 
              if (p.tema) {
                temasEnCarrito.push(p.tema.idTema);
              } else {
                temasEnCarrito.push(-1); // Sin temática
              }
            });
          }
        });
        cuponEntidad = await this.cuponesService.validate(codigoCupon, carrito.total, temasEnCarrito, idUsuario);
        const descuento = totalFinal * (Number(cuponEntidad?.porcentaje || 0) / 100);
        totalFinal -= descuento;
      } catch (e) {}
    }

    // Calcular costo de envío según el CP
    let costoEnvio = 0;
    if (direccionEnvio) {
      const cp = extraerCP(direccionEnvio);
      costoEnvio = calcularCostoEnvio(cp);
    }
    const totalConEnvio = totalFinal + costoEnvio;

    const totalFinalRedondeado = Number(totalConEnvio.toFixed(2));

    const nuevoPedido = this.pedidoRepository.create({
      usuario: { idUsuario } as any,
      total: totalFinalRedondeado,
      estado: 'PENDIENTE',
      cupon: cuponEntidad,
      direccionEnvio: direccionEnvio || undefined,
    });

    const pedidoGuardado = await this.pedidoRepository.save(nuevoPedido);

    // Creamos las lineas pero sin restar stock todavía
    for (const linea of carrito.lineas) {
      const lp = this.lineaPedidoRepository.create({
        cantidad: linea.cantidad,
        precioHistorico: linea.precioUnitario,
        pedido: pedidoGuardado as any,
        producto: linea.producto,
        combo: linea.combo,
      });
      await this.lineaPedidoRepository.save(lp);
    }

    return pedidoGuardado;
  }

  async procesarCompra(idUsuario: string, codigoCupon?: string, idPedido?: number) {
    // Si tenemos el idPedido explícito (del retorno de MP), lo usamos
    if (idPedido) {
      const pedido = await this.pedidoRepository.findOne({
        where: { idPedido, usuario: { idUsuario } },
        relations: ['lineas', 'lineas.producto', 'lineas.combo']
      });

      if (pedido) {
        if (pedido.estado === 'PENDIENTE') {
          return this.confirmarPago(pedido.idPedido);
        }
        if (pedido.estado === 'PAGADO') {
          return pedido; // Ya fue procesado por el webhook
        }
      }
      throw new BadRequestException('El pedido especificado no existe o ya fue cancelado.');
    }

    // Fallback: Si no hay idPedido, buscamos el último PENDIENTE
    const pedidoPendiente = await this.pedidoRepository.findOne({
      where: { usuario: { idUsuario }, estado: 'PENDIENTE' },
      order: { fecha: 'DESC' },
      relations: ['lineas', 'lineas.producto', 'lineas.combo']
    });

    if (pedidoPendiente) {
      return this.confirmarPago(pedidoPendiente.idPedido);
    } else {
      throw new BadRequestException('No hay pedido pendiente para confirmar.');
    }
  }

  async confirmarPago(idPedido: number) {
    const pedido = await this.pedidoRepository.findOne({
      where: { idPedido },
      relations: ['lineas', 'lineas.producto', 'lineas.combo', 'usuario']
    });

    if (!pedido || pedido.estado === 'PAGADO') return pedido;

    // 1. Restar Stock
    for (const linea of pedido.lineas) {
      if (linea.producto) {
        linea.producto.stock = Math.max(0, linea.producto.stock - linea.cantidad);
        await this.productoRepository.save(linea.producto);
      } else if (linea.combo) {
         // Cargar productos del combo si no están
         const comboCompleto = await this.comboRepository.findOne({ 
           where: { idCombo: linea.combo.idCombo }, 
           relations: ['productos'] 
         });
         if (comboCompleto && comboCompleto.productos) {
           for (const p of comboCompleto.productos) {
             p.stock = Math.max(0, p.stock - linea.cantidad);
             await this.productoRepository.save(p);
           }
         }
      }
    }

    // 2. Marcar como PAGADO
    pedido.estado = 'PAGADO';
    await this.pedidoRepository.save(pedido);

    // 3. Vaciar carrito
    const carrito = await this.carritoRepository.findOne({
      where: { usuario: { idUsuario: pedido.usuario.idUsuario } },
      relations: ['lineas']
    });
    if (carrito) {
      await this.lineaCarritoRepository.remove(carrito.lineas);
      carrito.total = 0;
      await this.carritoRepository.save(carrito);
    }

    // 4. Recalcular nivel y crear envio
    await this.usuariosService.recalcularNivel(pedido.usuario.idUsuario);
    
    const dir = pedido.direccionEnvio || pedido.usuario.direccion || '';
    const cp = extraerCP(dir);
    const costoEnvio = calcularCostoEnvio(cp);
    
    const envioCreado = await this.enviosService.crearEnvio(pedido.idPedido, cp, costoEnvio, dir);
    pedido.envio = envioCreado; // Asignar para que esté disponible en correos y frontend

    // 5. Enviar email de confirmación al usuario
    try {
      await this.mailService.enviarCorreoConfirmacion(pedido);
    } catch (e) {
      console.error('Error al enviar mail de confirmacion:', e);
    }

    return pedido;
  }

  async cancelarPedido(idPedido: number) {
    const pedido = await this.pedidoRepository.findOne({
      where: { idPedido },
      relations: ['usuario']
    });

    if (!pedido || pedido.estado === 'PAGADO') return pedido;

    pedido.estado = 'CANCELADO';
    return await this.pedidoRepository.save(pedido);
  }

  async findAllByUser(idUsuario: string) {
    return await this.pedidoRepository
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.lineas', 'lineas')
      .leftJoinAndSelect('lineas.producto', 'producto')
      .leftJoinAndSelect('lineas.combo', 'combo')
      .leftJoinAndSelect('pedido.envio', 'envio')
      .where('pedido.idUsuario = :idUsuario', { idUsuario })
      .orderBy('pedido.fecha', 'DESC')
      .getMany();
  }

  async findAllAdmin() {
    return await this.pedidoRepository
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.usuario', 'usuario')
      .leftJoinAndSelect('pedido.lineas', 'lineas')
      .leftJoinAndSelect('lineas.producto', 'producto')
      .leftJoinAndSelect('lineas.combo', 'combo')
      .orderBy('pedido.fecha', 'DESC')
      .getMany();
  }

  async handleWebhook(payload: any) {
    if (payload.type === 'payment') {
      const paymentId = payload.data.id;
      const payment = new Payment(this.mercadoPagoClient);

      try {
        const data = await payment.get({ id: paymentId });
        
        if (data.status === 'approved') {
          const idPedido = data.external_reference || data.metadata?.id_pedido;

          if (idPedido) {
            console.log(`Pago aprobado para el pedido ${idPedido}. Confirmando...`);
            try {
              await this.confirmarPago(Number(idPedido));
            } catch (e) {
              console.log('Error al confirmar pago desde webhook:', e.message);
            }
          }
        } else if (data.status === 'rejected' || data.status === 'cancelled') {
          const idPedido = data.external_reference || data.metadata?.id_pedido;
          if (idPedido) {
            console.log(`Pago rechazado/cancelado para el pedido ${idPedido}. Marcando como CANCELADO...`);
            await this.cancelarPedido(Number(idPedido));
          }
        }
      } catch (error) {
        console.error('Error al obtener datos del pago de Mercado Pago:', error);
      }
    }
    return { received: true };
  }
}