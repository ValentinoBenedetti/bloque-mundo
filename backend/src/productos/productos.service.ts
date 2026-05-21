import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { Tema } from '../temas/entities/tema.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Tema)
    private readonly temaRepository: Repository<Tema>,
  ) { }

  async create(createProductoDto: any) {
    // 1. Buscamos el tema por su ID
    const tema = await this.temaRepository.findOne({ where: { idTema: createProductoDto.idTema } });
    if (!tema) {
      throw new NotFoundException(`Tema con ID ${createProductoDto.idTema} no encontrado`);
    }

    // 2. Creamos la instancia del producto
    const nuevoProducto = this.productoRepository.create({
      ...createProductoDto,
      tema: tema, // Asignamos la relación
    });

    // 3. Lo guardamos en la base de datos
    return await this.productoRepository.save(nuevoProducto);
  }

  async findAll() {
    // Retornamos todos los productos, incluyendo la información de su tema
    return await this.productoRepository.find({ relations: ['tema'] });
  }

  async findOne(id: number) {
    const producto = await this.productoRepository.findOne({
      where: { idProducto: id },
      relations: ['tema']
    });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async update(id: number, updateProductoDto: any) {
    const { idTema, ...data } = updateProductoDto;
    
    const producto = await this.findOne(id);
    
    if (idTema) {
      const tema = await this.temaRepository.findOne({ where: { idTema } });
      if (!tema) throw new NotFoundException(`Tema con ID ${idTema} no encontrado`);
      producto.tema = tema;
    }

    Object.assign(producto, data);
    return await this.productoRepository.save(producto);
  }

  async remove(id: number) {
    const producto = await this.findOne(id);
    try {
      return await this.productoRepository.remove(producto);
    } catch (error) {
      // 23503 es el código de error de Postgres para violación de llave foránea
      if (error.code === '23503' || error.message?.includes('foreign key') || error.message?.includes('violates')) {
        throw new BadRequestException('No se puede eliminar el producto porque ya cuenta con compras registradas, opiniones de usuarios o se encuentra en carritos activos.');
      }
      throw error;
    }
  }
}