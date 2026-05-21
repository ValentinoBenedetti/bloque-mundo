import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { Producto } from '../productos/entities/producto.entity';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) { }

  async create(createCategoriaDto: any) {
    const nueva = this.categoriaRepository.create(createCategoriaDto);
    return await this.categoriaRepository.save(nueva);
  }

  async findAll() {
    return await this.categoriaRepository.find();
  }

  async remove(id: number) {
    const categoria = await this.categoriaRepository.findOne({ where: { idCategoria: id } });
    if (!categoria) {
      throw new NotFoundException(`Categoria con ID ${id} no encontrada`);
    }

    // Check if there are any products using this category string
    const count = await this.productoRepository.count({ where: { categoria: categoria.nombre } });
    if (count > 0) {
      throw new BadRequestException('No se puede eliminar la categoría porque tiene productos asociados');
    }

    return await this.categoriaRepository.remove(categoria);
  }
}
