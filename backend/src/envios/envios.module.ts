import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnviosController } from './envios.controller';
import { EnviosService } from './envios.service';
import { Envio } from './entities/envio.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Envio, Pedido])],
  controllers: [EnviosController],
  providers: [EnviosService],
  exports: [EnviosService]
})
export class EnviosModule {}
