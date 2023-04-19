import { Module } from '@nestjs/common';
import { AhpService } from './ahp.service';
import { AhpController } from './ahp.controller';

@Module({
  controllers: [AhpController],
  providers: [AhpService]
})
export class AhpModule {}
