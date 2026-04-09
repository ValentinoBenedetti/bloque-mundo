import { Test, TestingModule } from '@nestjs/testing';
import { LineaPedidoController } from './linea-pedido.controller';
import { LineaPedidoService } from './linea-pedido.service';

describe('LineaPedidoController', () => {
  let controller: LineaPedidoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LineaPedidoController],
      providers: [LineaPedidoService],
    }).compile();

    controller = module.get<LineaPedidoController>(LineaPedidoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
