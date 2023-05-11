import { Module } from '@nestjs/common';
import { TravelService } from './travel.service';
import { TravelController } from './travel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourEntity } from './entities/tour.entity';
import { JwtService } from '@nestjs/jwt';
import { BuyTourEntity } from './entities/buy-tour.entity';
import { UserEntity } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TourEntity, BuyTourEntity, UserEntity])],
  controllers: [TravelController],
  providers: [TravelService, JwtService],
})
export class TravelModule {}
