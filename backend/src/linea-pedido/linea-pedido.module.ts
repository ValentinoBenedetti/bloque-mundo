import { Module } from '@nestjs/common';
import { LineaPedidoService } from './linea-pedido.service';
import { LineaPedidoController } from './linea-pedido.controller';

@Module({
  controllers: [LineaPedidoController],
  providers: [LineaPedidoService],
})
export class LineaPedidoModule {}
