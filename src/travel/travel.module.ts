import { Module } from '@nestjs/common';
import { TravelService } from './travel.service';
import { TravelController } from './travel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourEntity } from './entities/tour.entity';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../user/entities/user.entity';
import { OrderTourEntity } from './entities/order-tour.entity';
import { SmsService } from '../sms/sms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TourEntity, OrderTourEntity, UserEntity]),
  ],
  controllers: [TravelController],
  providers: [TravelService, JwtService, SmsService],
})
export class TravelModule {}
