import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { LineaPedido } from '../linea-pedido/entities/linea-pedido.entity';
import { Carrito } from '../carrito/entities/carrito.entity';
import { LineaCarrito } from '../linea-carrito/entities/linea-carrito.entity';
import { Producto } from '../productos/entities/producto.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido) private pedidoRepository: Repository<Pedido>,
    @InjectRepository(LineaPedido) private lineaPedidoRepository: Repository<LineaPedido>,
    @InjectRepository(Carrito) private carritoRepository: Repository<Carrito>,
    @InjectRepository(LineaCarrito) private lineaCarritoRepository: Repository<LineaCarrito>,
    @InjectRepository(Producto) private productoRepository: Repository<Producto>,
  ) { }

  async procesarCompra(idUsuario: string) {
    // 1. Buscamos el carrito del usuario con todo lo que tiene adentro
    const carrito = await this.carritoRepository.findOne({
      where: { usuario: { idUsuario } },
      relations: ['lineas', 'lineas.producto'],
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
      const producto = linea.producto;

      // Última validación de seguridad (por si alguien compró justo antes)
      if (producto.stock < linea.cantidad) {
        throw new BadRequestException(`¡Ups! Alguien acaba de comprar los últimos ${producto.titulo}.`);
      }

      // Restamos el stock de la estantería
      producto.stock -= linea.cantidad;
      await this.productoRepository.save(producto);

      // Creamos la línea de la factura congelando el precio de hoy
      const lineaPedido = this.lineaPedidoRepository.create({
        cantidad: linea.cantidad,
        precioHistorico: linea.precioUnitario,
        pedido: pedidoGuardado,
        producto: producto,
      });
      await this.lineaPedidoRepository.save(lineaPedido);
    }

    // 4. Limpiamos la mesa: Vaciamos el carrito
    await this.lineaCarritoRepository.remove(carrito.lineas);
    carrito.total = 0;
    await this.carritoRepository.save(carrito);

    // Devolvemos el ticket de compra
    return this.pedidoRepository.findOne({
      where: { idPedido: pedidoGuardado.idPedido },
      relations: ['lineas', 'lineas.producto']
    });
  }

  async findAllByUser(idUsuario: string) {
    return await this.pedidoRepository
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.lineas', 'lineas')
      .leftJoinAndSelect('lineas.producto', 'producto')
      .where('pedido.idUsuario = :idUsuario', { idUsuario })
      .orderBy('pedido.fecha', 'DESC')
      .getMany();
  }
}