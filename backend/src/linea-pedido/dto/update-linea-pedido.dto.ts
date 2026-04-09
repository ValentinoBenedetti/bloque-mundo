import { PartialType } from '@nestjs/mapped-types';
import { CreateLineaPedidoDto } from './create-linea-pedido.dto';

export class UpdateLineaPedidoDto extends PartialType(CreateLineaPedidoDto) {}
