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

  async findAllByUser(usuarioId: string) {
    // Como usuarioId es string, lo pasamos directo
    return this.favoritosRepository.find({ where: { usuarioId } });
  }

  async toggleFavorite(usuarioId: string, productoId: any) {
    // Solo forzamos el producto a número, el usuario queda como string
    const idProducto = parseInt(productoId.toString(), 10);

    const existe = await this.favoritosRepository.findOne({
      where: { usuarioId: usuarioId, productoId: idProducto }
    });

    if (existe) {
      await this.favoritosRepository.remove(existe);
      return { message: 'Removido de favoritos', isFavorite: false };
    } else {
      const nuevoFavorito = this.favoritosRepository.create({
        usuarioId: usuarioId,
        productoId: idProducto
      });
      await this.favoritosRepository.save(nuevoFavorito);
      return { message: 'Agregado a favoritos', isFavorite: true };
    }
  }
}