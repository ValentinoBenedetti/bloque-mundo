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

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido) private pedidoRepository: Repository<Pedido>,
    @InjectRepository(LineaPedido) private lineaPedidoRepository: Repository<LineaPedido>,
    @InjectRepository(Carrito) private carritoRepository: Repository<Carrito>,
    @InjectRepository(LineaCarrito) private lineaCarritoRepository: Repository<LineaCarrito>,
    @InjectRepository(Producto) private productoRepository: Repository<Producto>,
    private usuariosService: UsuariosService,
  ) { }

  async procesarCompra(idUsuario: string) {
    // 1. Buscamos el carrito del usuario con todo lo que tiene adentro
    const carrito = await this.carritoRepository.findOne({
      where: { usuario: { idUsuario } },
      relations: ['lineas', 'lineas.producto', 'lineas.combo', 'lineas.combo.productos'],
    });

    if (!carrito || !carrito.lineas || carrito.lineas.length === 0) {
      throw new BadRequestException('No puedes comprar con un carrito vacío.');
    }

    // 2. Creamos el "esqueleto" del Pedido (Factura)
    const nuevoPedido = this.pedidoRepository.create({
      usuario: { idUsuario },
      total: carrito.total,
      estado: 'PAGADO', // Simulamos que ya pasó la tarjeta de crédito
    });

    const pedidoGuardado = await this.pedidoRepository.save(nuevoPedido);

    // 3. Movemos los items del carrito al pedido Y RESTAMOS EL STOCK
    for (const linea of carrito.lineas) {
      if (linea.producto) {
        const producto = linea.producto;
        if (producto.stock < linea.cantidad) {
          throw new BadRequestException(`¡Ups! Alguien acaba de comprar los últimos ${producto.titulo}.`);
        }
        producto.stock -= linea.cantidad;
        await this.productoRepository.save(producto);

        const lineaPedido = this.lineaPedidoRepository.create({
          cantidad: linea.cantidad,
          precioHistorico: linea.precioUnitario,
          pedido: pedidoGuardado,
        });
        lineaPedido.producto = producto;
        await this.lineaPedidoRepository.save(lineaPedido);
      } else if (linea.combo) {
        const combo = linea.combo;
        
        // Restamos stock a cada producto individual que conforma el combo
        if (combo.productos && combo.productos.length > 0) {
          for (const p of combo.productos) {
            if (p.stock < linea.cantidad) {
              throw new BadRequestException(`El combo ${combo.titulo} se agotó porque falta stock de ${p.titulo}.`);
            }
            p.stock -= linea.cantidad;
            await this.productoRepository.save(p);
          }
        }

        const lineaPedido = this.lineaPedidoRepository.create({
          cantidad: linea.cantidad,
          precioHistorico: linea.precioUnitario,
          pedido: pedidoGuardado,
        });
        lineaPedido.combo = combo;
        await this.lineaPedidoRepository.save(lineaPedido);
      }
    }

    // 4. Limpiamos la mesa: Vaciamos el carrito
    await this.lineaCarritoRepository.remove(carrito.lineas);
    carrito.total = 0;
    await this.carritoRepository.save(carrito);

    // 5. Recalcular el nivel del usuario
    await this.usuariosService.recalcularNivel(idUsuario);

    // Devolvemos el ticket de compra
    return this.pedidoRepository.findOne({
      where: { idPedido: pedidoGuardado.idPedido },
      relations: ['lineas', 'lineas.producto', 'lineas.combo']
    });
  }

  async findAllByUser(idUsuario: string) {
    return await this.pedidoRepository
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.lineas', 'lineas')
      .leftJoinAndSelect('lineas.producto', 'producto')
      .leftJoinAndSelect('lineas.combo', 'combo')
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
}