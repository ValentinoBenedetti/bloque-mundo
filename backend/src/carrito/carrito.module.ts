import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoService } from './carrito.service';
import { CarritoController } from './carrito.controller';
import { Carrito } from './entities/carrito.entity';
import { LineaCarrito } from '../linea-carrito/entities/linea-carrito.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Combo } from '../combos/entities/combo.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  // Importamos todas las entidades que el carrito necesita tocar
  imports: [TypeOrmModule.forFeature([Carrito, LineaCarrito, Producto, Combo, Usuario]),
    AuthModule,
  ],
  controllers: [CarritoController],
  providers: [CarritoService],
})
export class CarritoModule { }