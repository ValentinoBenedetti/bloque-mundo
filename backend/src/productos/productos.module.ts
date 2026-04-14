import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { Tema } from '../temas/entities/tema.entity'; // <-- Importamos la entidad Tema
import { AuthModule } from '../auth/auth.module';

@Module({
  // Acá está la magia: registramos ambas entidades juntas
  imports: [TypeOrmModule.forFeature([Producto, Tema]),
    AuthModule,
  ],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule { }