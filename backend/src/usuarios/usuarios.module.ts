import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';
import { NivelUsuario } from './entities/nivel-usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, NivelUsuario])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService], // 🔥 ESTO ES OBLIGATORI  O
})
export class UsuariosModule { }