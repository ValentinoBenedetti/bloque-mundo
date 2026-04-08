import { Injectable, NotFoundException } from '@nestjs/common';
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
}