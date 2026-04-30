import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) { }

  // POST: http://localhost:3000/pedidos/checkout
  @UseGuards(AuthGuard) // Solo gente logueada puede comprar
  @Post('checkout')
  async confirmarCompra(@Request() req: any) {
    // Sacamos el ID del usuario directamente de su "pulsera VIP" (Token)
    const idUsuario = req.user.sub;
    return this.pedidosService.procesarCompra(idUsuario);
  }

  // GET: http://localhost:3000/pedidos/usuario
  @UseGuards(AuthGuard)
  @Get('usuario')
  async obtenerHistorialCompras(@Request() req: any) {
    const idUsuario = req.user.sub;
    return this.pedidosService.findAllByUser(idUsuario);
  }
}