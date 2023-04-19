import { Test, TestingModule } from '@nestjs/testing';
import { AhpController } from './ahp.controller';
import { AhpService } from './ahp.service';

describe('AhpController', () => {
  let controller: AhpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AhpController],
      providers: [AhpService],
    }).compile();

    controller = module.get<AhpController>(AhpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
