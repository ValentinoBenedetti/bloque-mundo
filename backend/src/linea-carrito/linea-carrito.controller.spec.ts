import { Test, TestingModule } from '@nestjs/testing';
import { LineaCarritoController } from './linea-carrito.controller';
import { LineaCarritoService } from './linea-carrito.service';

describe('LineaCarritoController', () => {
  let controller: LineaCarritoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LineaCarritoController],
      providers: [LineaCarritoService],
    }).compile();

    controller = module.get<LineaCarritoController>(LineaCarritoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
