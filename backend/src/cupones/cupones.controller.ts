import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CuponesService } from './cupones.service';
import { CreateCuponDto } from './dto/create-cupon.dto';

@Controller('cupones')
export class CuponesController {
  constructor(private readonly cuponesService: CuponesService) {}

  @Post()
  create(@Body() createCuponDto: CreateCuponDto) {
    return this.cuponesService.create(createCuponDto);
  }

  @Get()
  findAll() {
    return this.cuponesService.findAll();
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.cuponesService.findOne(codigo);
  }

  @Post('validar')
  validate(@Body() body: { codigo: string; subtotal?: number; temasEnCarrito?: number[]; idUsuario?: string }) {
    return this.cuponesService.validate(body.codigo, body.subtotal, body.temasEnCarrito, body.idUsuario);
  }

  @Delete(':codigo')
  remove(@Param('codigo') codigo: string) {
    return this.cuponesService.remove(codigo);
  }
}
