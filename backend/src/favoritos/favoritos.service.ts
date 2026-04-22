import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorito } from './entities/favorito.entity';

@Injectable()
export class FavoritosService {
  constructor(
    @InjectRepository(Favorito)
    private favoritosRepository: Repository<Favorito>,
  ) { }

  // Buscar todos los favoritos de un usuario específico
  async findAllByUser(usuarioId: number) {
    return this.favoritosRepository.find({ where: { usuarioId } });
  }

  // Función "Interruptor": Agrega si no existe, borra si ya existe
  async toggleFavorite(usuarioId: number, productoId: number) {
    const existe = await this.favoritosRepository.findOne({
      where: { usuarioId, productoId }
    });

    if (existe) {
      await this.favoritosRepository.remove(existe);
      return { message: 'Removido de favoritos', isFavorite: false };
    } else {
      const nuevoFavorito = this.favoritosRepository.create({ usuarioId, productoId });
      await this.favoritosRepository.save(nuevoFavorito);
      return { message: 'Agregado a favoritos', isFavorite: true };
    }
  }
}