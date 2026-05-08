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
    const isCombo = typeof productoId === 'string' && productoId.startsWith('combo-');
    let idProducto: number | undefined = undefined;
    let idCombo: number | undefined = undefined;

    if (isCombo) {
      idCombo = parseInt(productoId.replace('combo-', ''), 10);
    } else {
      idProducto = parseInt(productoId.toString(), 10);
    }

    const whereClause: any = isCombo 
      ? { usuarioId: usuarioId, comboId: idCombo } 
      : { usuarioId: usuarioId, productoId: idProducto };

    const existe = await this.favoritosRepository.findOne({
      where: whereClause
    });

    if (existe) {
      await this.favoritosRepository.remove(existe);
      return { message: 'Removido de favoritos', isFavorite: false };
    } else {
      const nuevoFavorito = this.favoritosRepository.create({
        usuarioId: usuarioId
      });
      if (idProducto !== undefined) nuevoFavorito.productoId = idProducto;
      if (idCombo !== undefined) nuevoFavorito.comboId = idCombo;
      
      await this.favoritosRepository.save(nuevoFavorito);
      return { message: 'Agregado a favoritos', isFavorite: true };
    }
  }
}