import { Injectable } from '@nestjs/common';
import { CreateLineaPedidoDto } from './dto/create-linea-pedido.dto';
import { UpdateLineaPedidoDto } from './dto/update-linea-pedido.dto';

@Injectable()
export class LineaPedidoService {
  create(createLineaPedidoDto: CreateLineaPedidoDto) {
    return 'This action adds a new lineaPedido';
  }

  findAll() {
    return `This action returns all lineaPedido`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lineaPedido`;
  }

  update(id: number, updateLineaPedidoDto: UpdateLineaPedidoDto) {
    return `This action updates a #${id} lineaPedido`;
  }

  remove(id: number) {
    return `This action removes a #${id} lineaPedido`;
  }
}
