import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'; // <-- AGREGÁ UseGuards ACÁ
import { ProductosService } from './productos.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) { }

  @UseGuards(AuthGuard, RolesGuard) // <-- Ahora esto debería ponerse en color normal
  @Post()
  create(@Body() createProductoDto: any) {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  findAll() {
    return this.productosService.findAll();
  }
}