import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LineaPedidoService } from './linea-pedido.service';
import { CreateLineaPedidoDto } from './dto/create-linea-pedido.dto';
import { UpdateLineaPedidoDto } from './dto/update-linea-pedido.dto';

@Controller('linea-pedido')
export class LineaPedidoController {
  constructor(private readonly lineaPedidoService: LineaPedidoService) {}

  @Post()
  create(@Body() createLineaPedidoDto: CreateLineaPedidoDto) {
    return this.lineaPedidoService.create(createLineaPedidoDto);
  }

  @Get()
  findAll() {
    return this.lineaPedidoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lineaPedidoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLineaPedidoDto: UpdateLineaPedidoDto) {
    return this.lineaPedidoService.update(+id, updateLineaPedidoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lineaPedidoService.remove(+id);
  }
}
