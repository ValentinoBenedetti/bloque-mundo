import { Test, TestingModule } from '@nestjs/testing';
import { TemasService } from './temas.service';

describe('TemasService', () => {
  let service: TemasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemasService],
    }).compile();

    service = module.get<TemasService>(TemasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
