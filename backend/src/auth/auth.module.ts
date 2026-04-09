import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    // Configuramos la fábrica de pases VIP (Tokens)
    JwtModule.register({
      global: true, // Para poder usarlo en toda la app
      secret: 'EL_SECRETO_DE_BLOQUE_MUNDO_2026', // En la vida real, esto no va en el código
      signOptions: { expiresIn: '2h' }, // El pase vence en 2 horas por seguridad
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }