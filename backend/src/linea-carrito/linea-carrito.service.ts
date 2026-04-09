import { Injectable } from '@nestjs/common';
import { CreateLineaCarritoDto } from './dto/create-linea-carrito.dto';
import { UpdateLineaCarritoDto } from './dto/update-linea-carrito.dto';

@Injectable()
export class LineaCarritoService {
  create(createLineaCarritoDto: CreateLineaCarritoDto) {
    return 'This action adds a new lineaCarrito';
  }

  findAll() {
    return `This action returns all lineaCarrito`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lineaCarrito`;
  }

  update(id: number, updateLineaCarritoDto: UpdateLineaCarritoDto) {
    return `This action updates a #${id} lineaCarrito`;
  }

  remove(id: number) {
    return `This action removes a #${id} lineaCarrito`;
  }
}
