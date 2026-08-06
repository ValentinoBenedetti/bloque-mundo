import { Controller, Post, Get, Patch, Param, UseGuards, Request, Body, Redirect } from '@nestjs/common';
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
    return this.pedidosService.procesarCompra(idUsuario, body?.codigoCupon, body?.idPedido);
  }

  // POST: http://localhost:3000/pedidos/crear-preferencia
  @UseGuards(AuthGuard)
  @Post('crear-preferencia')
  async crearPreferencia(@Request() req: any, @Body() body: any) {
    const idUsuario = req.user.sub;
    return this.pedidosService.crearPreferencia(idUsuario, body?.codigoCupon, body?.direccionEnvio);
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

  // GET: http://localhost:3000/pedidos/retorno
  // Este endpoint sirve de puente para que Mercado Pago acepte el auto_return (que requiere HTTPS)
  // y luego redirija al usuario a su localhost:5173 (que es HTTP)
  @Get('retorno')
  @Redirect('http://localhost:5173/perfil/compras', 302)
  async retornoMercadoPago(@Request() req: any) {
    // Obtenemos los parametros de la URL original
    const url = new URL(req.url, `http://${req.headers.host}`);
    const status = url.searchParams.get('status');
    const idPedido = url.searchParams.get('idPedido') || url.searchParams.get('external_reference');

    // Redirigimos al frontend local con los parametros
    return { url: `http://localhost:5173/perfil/compras?status=${status}&idPedido=${idPedido}` };
  }

  // PATCH: http://localhost:3000/pedidos/:id/cancelar
  @UseGuards(AuthGuard)
  @Patch(':id/cancelar')
  async cancelarPedido(@Param('id') id: string) {
    return this.pedidosService.cancelarPedido(Number(id));
  }
}