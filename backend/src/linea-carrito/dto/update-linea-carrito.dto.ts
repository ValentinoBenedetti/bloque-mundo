import { PartialType } from '@nestjs/mapped-types';
import { CreateLineaCarritoDto } from './create-linea-carrito.dto';

export class UpdateLineaCarritoDto extends PartialType(CreateLineaCarritoDto) {}
