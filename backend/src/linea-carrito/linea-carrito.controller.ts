import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LineaCarritoService } from './linea-carrito.service';
import { CreateLineaCarritoDto } from './dto/create-linea-carrito.dto';
import { UpdateLineaCarritoDto } from './dto/update-linea-carrito.dto';

@Controller('linea-carrito')
export class LineaCarritoController {
  constructor(private readonly lineaCarritoService: LineaCarritoService) {}

  @Post()
  create(@Body() createLineaCarritoDto: CreateLineaCarritoDto) {
    return this.lineaCarritoService.create(createLineaCarritoDto);
  }

  @Get()
  findAll() {
    return this.lineaCarritoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lineaCarritoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLineaCarritoDto: UpdateLineaCarritoDto) {
    return this.lineaCarritoService.update(+id, updateLineaCarritoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lineaCarritoService.remove(+id);
  }
}
