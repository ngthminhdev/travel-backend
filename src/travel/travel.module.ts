import { Module } from '@nestjs/common';
import { TravelService } from './travel.service';
import { TravelController } from './travel.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { TourEntity } from "./entities/tour.entity";

@Module({
  imports: [TypeOrmModule.forFeature([TourEntity])],
  controllers: [TravelController],
  providers: [TravelService]
})
export class TravelModule {}
