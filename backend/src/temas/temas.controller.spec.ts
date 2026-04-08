import { Test, TestingModule } from '@nestjs/testing';
import { TemasController } from './temas.controller';
import { TemasService } from './temas.service';

describe('TemasController', () => {
  let controller: TemasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemasController],
      providers: [TemasService],
    }).compile();

    controller = module.get<TemasController>(TemasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
