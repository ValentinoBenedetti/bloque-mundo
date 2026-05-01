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
    const { idProducto, idPedido, comentario, estrellas, esAnonima } = createResenaDto;

    // Verificar si el usuario ya opinó sobre este producto EN ESTA COMPRA
    const resenaExistente = await this.resenaRepository.findOne({
      where: { 
        usuario: { idUsuario }, 
        producto: { idProducto },
        pedido: { idPedido }
      },
    });

    if (resenaExistente) {
      throw new BadRequestException('Ya has dejado una reseña para este producto en esta compra.');
    }

    const nuevaResena = this.resenaRepository.create({
      usuario: { idUsuario },
      producto: { idProducto },
      pedido: { idPedido },
      comentario,
      estrellas,
      esAnonima: esAnonima ?? true,
    });

    return await this.resenaRepository.save(nuevaResena);
  }

  async findByProducto(idProducto: number) {
    const resenas = await this.resenaRepository.find({
      where: { producto: { idProducto }, eliminadaPorAdmin: false },
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

  async hasUserReviewed(idUsuario: string, idProducto: number, idPedido: number) {
    const count = await this.resenaRepository.count({
      where: { 
        usuario: { idUsuario }, 
        producto: { idProducto },
        pedido: { idPedido }
      },
    });
    return count > 0;
  }

  async findExistingReview(idUsuario: string, idProducto: number, idPedido: number) {
    return await this.resenaRepository.findOne({
      where: { 
        usuario: { idUsuario }, 
        producto: { idProducto },
        pedido: { idPedido }
      },
    });
  }

  async findExistingReviewByAdmin(idUsuario: string, idProducto: number, idPedido: number) {
    return await this.resenaRepository.findOne({
      where: { 
        usuario: { idUsuario }, 
        producto: { idProducto },
        pedido: { idPedido }
      },
      relations: ['usuario']
    });
  }

  async deleteByAdmin(idResena: number) {
    const resena = await this.resenaRepository.findOne({ where: { idResena } });
    if (!resena) {
      throw new BadRequestException('Reseña no encontrada');
    }
    resena.eliminadaPorAdmin = true;
    return await this.resenaRepository.save(resena);
  }
}
