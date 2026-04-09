import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // POST: http://localhost:3000/auth/registro
  @Post('registro')
  registrar(@Body() body: any) {
    return this.authService.registrar(body);
  }

  // POST: http://localhost:3000/auth/login
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }
}