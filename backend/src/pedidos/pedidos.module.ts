import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pedido } from './entities/pedido.entity';
import { LineaPedido } from '../linea-pedido/entities/linea-pedido.entity';
import { Carrito } from '../carrito/entities/carrito.entity';
import { LineaCarrito } from '../linea-carrito/entities/linea-carrito.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Combo } from '../combos/entities/combo.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuthModule } from '../auth/auth.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { EnviosModule } from '../envios/envios.module';
import { CuponesModule } from '../cupones/cupones.module';

@Module({
  // Importamos todo lo necesario para procesar la compra
  imports: [TypeOrmModule.forFeature([Pedido, LineaPedido, Carrito, LineaCarrito, Producto, Combo, Usuario]),
    AuthModule,
    UsuariosModule,
    EnviosModule,
    CuponesModule
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule { }