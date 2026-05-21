import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tema } from './entities/tema.entity';

@Injectable()
export class TemasService {
  constructor(
    @InjectRepository(Tema)
    private readonly temaRepository: Repository<Tema>,
  ) { }

  async create(createTemaDto: any) {
    const nuevoTema = this.temaRepository.create(createTemaDto);
    return await this.temaRepository.save(nuevoTema);
  }

  async findAll() {
    return await this.temaRepository.find();
  }

  async remove(id: number) {
    const tema = await this.temaRepository.findOne({ 
      where: { idTema: id }, 
      relations: ['productos'] 
    });
    if (!tema) {
      throw new NotFoundException(`Tema con ID ${id} no encontrado`);
    }
    if (tema.productos && tema.productos.length > 0) {
      throw new BadRequestException('No se puede eliminar el tema porque tiene productos asociados');
    }
    return await this.temaRepository.remove(tema);
  }
}