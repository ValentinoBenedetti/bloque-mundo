import { Test, TestingModule } from '@nestjs/testing';
import { LineaPedidoService } from './linea-pedido.service';

describe('LineaPedidoService', () => {
  let service: LineaPedidoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LineaPedidoService],
    }).compile();

    service = module.get<LineaPedidoService>(LineaPedidoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
