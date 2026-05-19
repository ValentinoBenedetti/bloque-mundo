import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';
import { NivelUsuario } from './entities/nivel-usuario.entity';
import { MailService } from '../pedidos/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, NivelUsuario])],
  controllers: [UsuariosController],
  providers: [UsuariosService, MailService],
  exports: [UsuariosService],
})
export class UsuariosModule { }