import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pedido } from './entities/pedido.entity';
import { LineaPedido } from '../linea-pedido/entities/linea-pedido.entity';
import { Carrito } from '../carrito/entities/carrito.entity';
import { LineaCarrito } from '../linea-carrito/entities/linea-carrito.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  // Importamos todo lo necesario para procesar la compra
  imports: [TypeOrmModule.forFeature([Pedido, LineaPedido, Carrito, LineaCarrito, Producto, Usuario]),
    AuthModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule { }