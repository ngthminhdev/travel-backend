import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourEntity } from '../travel/entities/tour.entity';
import { OrderTourEntity } from '../travel/entities/order-tour.entity';
import { UserEntity } from '../user/entities/user.entity';
import { DeviceEntity } from '../auth/entities/device.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TourEntity,
      OrderTourEntity,
      UserEntity,
      DeviceEntity,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
