import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resena } from './entities/resena.entity';

@Injectable()
export class ResenasService {
  constructor(
    @InjectRepository(Resena)
    private resenaRepository: Repository<Resena>,
  ) {}

  async create(idUsuario: string, createResenaDto: any) {
    const { idProducto, comentario, estrellas, esAnonima } = createResenaDto;

    // Verificar si el usuario ya opin sobre este producto
    const resenaExistente = await this.resenaRepository.findOne({
      where: { 
        usuario: { idUsuario }, 
        producto: { idProducto } 
      },
    });

    if (resenaExistente) {
      throw new BadRequestException('Ya has dejado una reseña para este producto.');
    }

    const nuevaResena = this.resenaRepository.create({
      usuario: { idUsuario },
      producto: { idProducto },
      comentario,
      estrellas,
      esAnonima: esAnonima ?? true,
    });

    return await this.resenaRepository.save(nuevaResena);
  }

  async findByProducto(idProducto: number) {
    const resenas = await this.resenaRepository.find({
      where: { producto: { idProducto } },
      relations: ['usuario'],
      order: { idResena: 'DESC' },
    });

    return resenas.map(resena => {
      if (resena.esAnonima) {
        return {
          ...resena,
          usuario: { nombre: 'Anónimo', apellido: '' }
        };
      }
      return resena;
    });
  }

  async hasUserReviewed(idUsuario: string, idProducto: number) {
    const count = await this.resenaRepository.count({
      where: { 
        usuario: { idUsuario }, 
        producto: { idProducto } 
      },
    });
    return count > 0;
  }

  async findExistingReview(idUsuario: string, idProducto: number) {
    return await this.resenaRepository.findOne({
      where: { 
        usuario: { idUsuario }, 
        producto: { idProducto } 
      },
    });
  }
}
