import { Controller, Post, Get, Patch, Param, UseGuards, Request, Body } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) { }

  // POST: http://localhost:3000/pedidos/checkout
  @UseGuards(AuthGuard) // Solo gente logueada puede comprar
  @Post('checkout')
  async confirmarCompra(@Request() req: any, @Body() body: any) {
    // Sacamos el ID del usuario directamente de su "pulsera VIP" (Token)
    const idUsuario = req.user.sub;
    return this.pedidosService.procesarCompra(idUsuario, body?.codigoCupon);
  }

  // POST: http://localhost:3000/pedidos/crear-preferencia
  @UseGuards(AuthGuard)
  @Post('crear-preferencia')
  async crearPreferencia(@Request() req: any, @Body() body: any) {
    const idUsuario = req.user.sub;
    return this.pedidosService.crearPreferencia(idUsuario, body?.codigoCupon);
  }

  // GET: http://localhost:3000/pedidos/usuario
  @UseGuards(AuthGuard)
  @Get('usuario')
  async obtenerHistorialCompras(@Request() req: any) {
    const idUsuario = req.user.sub;
    return this.pedidosService.findAllByUser(idUsuario);
  }

  // GET: http://localhost:3000/pedidos/admin
  @UseGuards(AuthGuard, RolesGuard)
  @Get('admin')
  async obtenerHistorialVentas() {
    return this.pedidosService.findAllAdmin();
  }

  // POST: http://localhost:3000/pedidos/webhook
  // Este endpoint NO tiene AuthGuard porque lo llama Mercado Pago
  @Post('webhook')
  async recibirWebhook(@Body() payload: any) {
    return this.pedidosService.handleWebhook(payload);
  }

  // PATCH: http://localhost:3000/pedidos/:id/confirmar
  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':id/confirmar')
  async confirmarPagoAdmin(@Param('id') id: string) {
    return this.pedidosService.confirmarPago(Number(id));
  }

  // PATCH: http://localhost:3000/pedidos/:id/cancelar
  @UseGuards(AuthGuard)
  @Patch(':id/cancelar')
  async cancelarPedido(@Param('id') id: string) {
    return this.pedidosService.cancelarPedido(Number(id));
  }
}