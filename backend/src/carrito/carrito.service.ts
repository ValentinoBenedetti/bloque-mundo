import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrito } from './entities/carrito.entity';
import { LineaCarrito } from '../linea-carrito/entities/linea-carrito.entity';
import { Producto } from '../productos/entities/producto.entity';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(Carrito)
    private readonly carritoRepository: Repository<Carrito>,
    @InjectRepository(LineaCarrito)
    private readonly lineaRepository: Repository<LineaCarrito>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) { }

  async agregarProducto(idUsuario: string, idProducto: number, cantidad: number) {
    // 1. Validar existencia del producto y stock disponible
    const producto = await this.productoRepository.findOne({ where: { idProducto } });
    if (!producto) throw new NotFoundException('El LEGO que buscas no existe.');
    if (producto.stock < cantidad) throw new BadRequestException(`Solo quedan ${producto.stock} unidades disponibles.`);

    // 2. Buscar el carrito activo del usuario
    let carrito = await this.carritoRepository.findOne({
      where: { usuario: { idUsuario } },
      relations: ['lineas', 'lineas.producto']
    });

    // Si no tiene carrito, se lo creamos en el momento
    if (!carrito) {
      carrito = this.carritoRepository.create({ usuario: { idUsuario }, total: 0 });
      await this.carritoRepository.save(carrito);
    }

    // 3. ¿El producto ya estaba en el carrito?
    let linea = carrito.lineas?.find(l => l.producto.idProducto === idProducto);

    if (linea) {
      // Si ya estaba, sumamos la cantidad (validando stock nuevamente)
      if (producto.stock < (linea.cantidad + cantidad)) {
        throw new BadRequestException('No puedes agregar más unidades de las que hay en stock.');
      }
      const nuevaCantidad = linea.cantidad + cantidad;
      if (nuevaCantidad <= 0) {
        await this.lineaRepository.remove(linea);
        return this.actualizarTotal(carrito.idCarrito);
      }
      linea.cantidad = nuevaCantidad;
    } else {
      // Si es nuevo, creamos una nueva línea de carrito
      if (cantidad <= 0) return this.actualizarTotal(carrito.idCarrito);
      linea = this.lineaRepository.create({
        carrito,
        producto,
        cantidad,
        precioUnitario: producto.precio
      });
    }

    await this.lineaRepository.save(linea);

    // 4. Recalcular el total general del carrito y devolverlo actualizado
    return this.actualizarTotal(carrito.idCarrito);
  }

  // Función privada para mantener el total siempre al día
  private async actualizarTotal(idCarrito: number) {
    const carrito = await this.carritoRepository.findOne({
      where: { idCarrito },
      relations: ['lineas', 'lineas.producto', 'usuario']
    });

    // 1. Le aseguramos a TypeScript que el carrito existe
    if (!carrito) {
      throw new NotFoundException('Carrito no encontrado para actualizar el total.');
    }

    // 2. Por seguridad, si lineas viene indefinido, le asignamos un array vacío
    const lineasSeguras = carrito.lineas || [];

    // 3. Calculamos el total
    carrito.total = lineasSeguras.reduce((acc, linea) => {
      return acc + (Number(linea.precioUnitario) * linea.cantidad);
    }, 0);

    await this.carritoRepository.save(carrito);
    
    // Devolvemos el carrito con todas las relaciones cargadas
    return carrito;
  }

  async obtenerCarrito(idUsuario: string) {
    const carrito = await this.carritoRepository.findOne({
      where: { usuario: { idUsuario } },
      relations: ['lineas', 'lineas.producto']
    });
    // Si no existe, devolvemos un objeto vacío estructurado igual
    if (!carrito) return { total: 0, lineas: [] };
    return carrito;
  }

  async quitarProducto(idUsuario: string, idProducto: number) {
    const carrito = await this.carritoRepository.findOne({
      where: { usuario: { idUsuario } },
      relations: ['lineas', 'lineas.producto']
    });

    if (!carrito) throw new NotFoundException('Carrito no encontrado.');

    const linea = carrito.lineas?.find(l => l.producto.idProducto === idProducto);
    if (linea) {
      await this.lineaRepository.remove(linea);
      return this.actualizarTotal(carrito.idCarrito);
    }
    return carrito;
  }

  async vaciarCarrito(idUsuario: string) {
    const carrito = await this.carritoRepository.findOne({
      where: { usuario: { idUsuario } },
      relations: ['lineas', 'lineas.producto']
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