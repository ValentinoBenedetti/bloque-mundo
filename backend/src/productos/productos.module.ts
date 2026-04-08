import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { Tema } from '../temas/entities/tema.entity'; // <-- Importamos la entidad Tema

@Module({
  // Acá está la magia: registramos ambas entidades juntas
  imports: [TypeOrmModule.forFeature([Producto, Tema])],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule { }