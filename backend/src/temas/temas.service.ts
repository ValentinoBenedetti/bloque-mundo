import { Injectable } from '@nestjs/common';
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
}