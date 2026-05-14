import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrito } from './entities/carrito.entity';
import { LineaCarrito } from '../linea-carrito/entities/linea-carrito.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Combo } from '../combos/entities/combo.entity';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(Carrito)
    private readonly carritoRepository: Repository<Carrito>,
    @InjectRepository(LineaCarrito)
    private readonly lineaRepository: Repository<LineaCarrito>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Combo)
    private readonly comboRepository: Repository<Combo>,
  ) { }

  async agregarProducto(idUsuario: string, productoId: any, cantidad: number) {
    const isCombo = typeof productoId === 'string' && productoId.startsWith('combo-');
    
    let item: Producto | Combo | null = null;
    let itemIdStr = productoId.toString();
    
    if (isCombo) {
      const idCombo = parseInt(productoId.replace('combo-', ''), 10);
      item = await this.comboRepository.findOne({ where: { idCombo }, relations: ['productos'] });
      if (!item) throw new NotFoundException('El combo que buscas no existe.');
      if (!item.productos || item.productos.length === 0) throw new BadRequestException('El combo está vacío y no se puede comprar.');
    } else {
      const idProducto = parseInt(productoId.toString(), 10);
      item = await this.productoRepository.findOne({ where: { idProducto } });
      if (!item) throw new NotFoundException('El LEGO que buscas no existe.');
    }

    // 2. Buscar el carrito activo del usuario para cruzar información de stock
    let carrito = await this.carritoRepository.findOne({
      where: { usuario: { idUsuario } },
      relations: ['lineas', 'lineas.producto', 'lineas.combo', 'lineas.combo.productos']
    });

    if (!carrito) {
      carrito = this.carritoRepository.create({ usuario: { idUsuario }, total: 0 });
      await this.carritoRepository.save(carrito);
    }
    
    if (!carrito.lineas) carrito.lineas = [];

    // Verificamos el stock global cruzado para cada producto involucrado
    const productosAfectados = isCombo ? (item as Combo).productos : [(item as Producto)];
    
    for (const prod of productosAfectados) {
      // Calculamos cuánto de este producto YA está reservado en el carrito
      let cantidadEnCarrito = 0;
      
      for (const linea of carrito.lineas) {
        if (linea.producto && linea.producto.idProducto === prod.idProducto) {
          cantidadEnCarrito += linea.cantidad;
        } else if (linea.combo && linea.combo.productos) {
          const loContiene = linea.combo.productos.some(p => p.idProducto === prod.idProducto);
          if (loContiene) {
            cantidadEnCarrito += linea.cantidad;
          }
        }
      }
      
      // La demanda total es lo que ya tengo en el carrito + lo que estoy intentando sumar
      const demandaTotal = cantidadEnCarrito + cantidad;
      
      if (demandaTotal > prod.stock) {
        if (cantidadEnCarrito === 0) {
          throw new BadRequestException(`El stock máximo disponible de "${prod.titulo}" es de ${prod.stock} unidades.`);
        } else {
          if (isCombo) {
            throw new BadRequestException(`No hay suficiente stock de "${prod.titulo}" para agregar este combo. Ya tienes ${cantidadEnCarrito} en tu carrito y el stock disponible es de ${prod.stock}.`);
          } else {
            throw new BadRequestException(`No puedes agregar más "${prod.titulo}". Ya tienes ${cantidadEnCarrito} en tu carrito y el stock disponible es de ${prod.stock}.`);
          }
        }
      }
    }



    // 3. ¿El item ya estaba en el carrito?
    let linea = isCombo 
      ? carrito.lineas.find(l => l.combo?.idCombo === (item as Combo).idCombo)
      : carrito.lineas.find(l => l.producto?.idProducto === (item as Producto).idProducto);

    if (linea) {
      const nuevaCantidad = linea.cantidad + cantidad;
      if (nuevaCantidad <= 0) {
        await this.lineaRepository.remove(linea);
        return this.actualizarTotal(carrito.idCarrito);
      }
      linea.cantidad = nuevaCantidad;
    } else {
      if (cantidad <= 0) return this.actualizarTotal(carrito.idCarrito);
      linea = this.lineaRepository.create({
        carrito,
        cantidad,
        precioUnitario: item.precio
      });
      if (isCombo) {
        linea.combo = item as Combo;
      } else {
        linea.producto = item as Producto;
      }
    }

    await this.lineaRepository.save(linea);

    return this.actualizarTotal(carrito.idCarrito);
  }

  // Función privada para mantener el total siempre al día
  private async actualizarTotal(idCarrito: number) {
    const carrito = await this.carritoRepository.findOne({
      where: { idCarrito },
      relations: ['lineas', 'lineas.producto', 'lineas.producto.tema', 'lineas.combo', 'lineas.combo.productos', 'lineas.combo.productos.tema', 'usuario', 'usuario.nivel'],
      order: {
        lineas: {
          idLineaCarrito: 'ASC'
        }
      }
    });

    // 1. Le aseguramos a TypeScript que el carrito existe
    if (!carrito) {
      throw new NotFoundException('Carrito no encontrado para actualizar el total.');
    }

    // 2. Por seguridad, si lineas viene indefinido, le asignamos un array vacío
    const lineasSeguras = carrito.lineas || [];

    // 3. Calculamos el total
    const totalBruto = lineasSeguras.reduce((acc, linea) => {
      return acc + (Number(linea.precioUnitario) * linea.cantidad);
    }, 0);

    carrito.total = totalBruto;

    // 4. Aplicamos descuento por nivel si corresponde
    const porcentaje = Number(carrito.usuario?.nivel?.porcentajeDescuento || 0);
    carrito.descuentoAplicado = totalBruto * (porcentaje / 100);
    carrito.totalConDescuento = totalBruto - carrito.descuentoAplicado;

    await this.carritoRepository.save(carrito);
    
    // Devolvemos el carrito con todas las relaciones cargadas
    return carrito;
  }

  async obtenerCarrito(idUsuario: string) {
    const carrito = await this.carritoRepository.findOne({
      where: { usuario: { idUsuario } },
      relations: ['lineas', 'lineas.producto', 'lineas.producto.tema', 'lineas.combo', 'lineas.combo.productos', 'lineas.combo.productos.tema', 'usuario', 'usuario.nivel'],
      order: {
        lineas: {
          idLineaCarrito: 'ASC'
        }
      }
    });
    // Si no existe, devolvemos un objeto vacío estructurado igual
    if (!carrito) return { total: 0, lineas: [] };
    return carrito;
  }

  async quitarProducto(idUsuario: string, productoId: any) {
    const carrito = await this.carritoRepository.findOne({
      where: { usuario: { idUsuario } },
      relations: ['lineas', 'lineas.producto', 'lineas.combo', 'usuario', 'usuario.nivel']
    });

    if (!carrito) throw new NotFoundException('Carrito no encontrado.');

    const isCombo = typeof productoId === 'string' && productoId.startsWith('combo-');
    
    let linea;
    if (isCombo) {
      const idCombo = parseInt(productoId.replace('combo-', ''), 10);
      linea = carrito.lineas?.find(l => l.combo?.idCombo === idCombo);
    } else {
      const idProducto = parseInt(productoId.toString(), 10);
      linea = carrito.lineas?.find(l => l.producto?.idProducto === idProducto);
    }

    if (linea) {
      await this.lineaRepository.remove(linea);
      return this.actualizarTotal(carrito.idCarrito);
    }
    return carrito;
  }

  async vaciarCarrito(idUsuario: string) {
    const carrito = await this.carritoRepository.findOne({
      where: { usuario: { idUsuario } },
      relations: ['lineas', 'lineas.producto', 'usuario', 'usuario.nivel']
    });

    if (carrito && carrito.lineas) {
      await this.lineaRepository.remove(carrito.lineas);
      carrito.total = 0;
      carrito.lineas = [];
      return await this.carritoRepository.save(carrito);
    }
    return carrito;
  }
}