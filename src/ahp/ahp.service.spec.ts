import { Test, TestingModule } from '@nestjs/testing';
import { AhpService } from './ahp.service';

describe('AhpService', () => {
  let service: AhpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AhpService],
    }).compile();

    service = module.get<AhpService>(AhpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
