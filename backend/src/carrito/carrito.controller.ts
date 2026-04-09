import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CarritoService } from './carrito.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) { }

  // 1. AGREGAR PRODUCTO (Protegido)
  @UseGuards(AuthGuard)
  @Post('agregar')
  async agregar(
    @Request() req: any, // <-- Le agregamos ": any" para que no chille con el .user
    @Body() data: { idProducto: number; cantidad: number }
  ) {
    const idUsuario = req.user.sub;
    return this.carritoService.agregarProducto(idUsuario, data.idProducto, data.cantidad);
  }

  // 2. VER MI CARRITO (Protegido)
  @UseGuards(AuthGuard)
  @Get()
  async verCarrito(@Request() req: any) { // <-- También acá ": any"
    const idUsuario = req.user.sub;
    return this.carritoService.obtenerCarrito(idUsuario);
  }
}