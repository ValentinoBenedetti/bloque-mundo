import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // 🔥 NUEVO: GET http://localhost:3000/auth/verify/:email
  // Este es el que usa el Modal de React para saber si pedir datos extra o no
  @Get('verify/:email')
  async verificarUsuario(@Param('email') email: string) {
    return this.authService.verificarExistencia(email);
  }

  // POST: http://localhost:3000/auth/registro
  @Post('registro')
  registrar(@Body() body: any) {
    // Este ahora llamará a la lógica de generar ID de 5 dígitos
    return this.authService.registrarConGoogle(body);
  }

  // POST: http://localhost:3000/auth/login
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }
}