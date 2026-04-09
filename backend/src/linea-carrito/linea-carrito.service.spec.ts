import { Test, TestingModule } from '@nestjs/testing';
import { LineaCarritoService } from './linea-carrito.service';

describe('LineaCarritoService', () => {
  let service: LineaCarritoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LineaCarritoService],
    }).compile();

    service = module.get<LineaCarritoService>(LineaCarritoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
