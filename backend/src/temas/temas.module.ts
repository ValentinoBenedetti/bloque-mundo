import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemasService } from './temas.service';
import { TemasController } from './temas.controller';
import { Tema } from './entities/tema.entity'; // <-- Importar

@Module({
  imports: [TypeOrmModule.forFeature([Tema])], // <-- Registrar
  controllers: [TemasController],
  providers: [TemasService],
})
export class TemasModule { }