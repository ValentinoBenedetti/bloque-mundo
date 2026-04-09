import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LineaCarritoService } from './linea-carrito.service';
import { LineaCarritoController } from './linea-carrito.controller';
import { LineaCarrito } from './entities/linea-carrito.entity';
import { Carrito } from '../carrito/entities/carrito.entity';
import { Producto } from '../productos/entities/producto.entity';

@Module({
  // Registramos las entidades para que TypeORM las reconozca en este módulo
  imports: [TypeOrmModule.forFeature([LineaCarrito, Carrito, Producto])],
  controllers: [LineaCarritoController],
  providers: [LineaCarritoService],
})
export class LineaCarritoModule { }