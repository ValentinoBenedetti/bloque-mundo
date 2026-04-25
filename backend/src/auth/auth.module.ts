import { Module, forwardRef } from '@nestjs/common'; // 🔥 Agregamos forwardRef arriba
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    forwardRef(() => UsuariosModule), // 🔥 LA MAGIA: Le avisamos que lo espere
    TypeOrmModule.forFeature([Usuario]),
    JwtModule.register({
      global: true,
      secret: 'EL_SECRETO_DE_BLOQUE_MUNDO_2026',
      signOptions: { expiresIn: '2h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }