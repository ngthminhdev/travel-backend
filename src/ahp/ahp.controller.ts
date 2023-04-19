import {Controller, Get, Query} from '@nestjs/common';
import {AhpService} from './ahp.service';

@Controller('ahp')
export class AhpController {
  constructor(private readonly ahpService: AhpService) {}

  @Get()
  find(@Query() query: string) {
    return this.ahpService.find(query);
  }
}
