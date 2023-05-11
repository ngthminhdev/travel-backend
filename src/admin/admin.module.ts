import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourEntity } from '../travel/entities/tour.entity';
import { BuyTourEntity } from '../travel/entities/buy-tour.entity';
import { UserEntity } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TourEntity, BuyTourEntity, UserEntity])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
