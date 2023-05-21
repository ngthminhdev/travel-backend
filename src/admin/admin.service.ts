import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { TourEntity } from '../travel/entities/tour.entity';
import { DataSource, In, Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { TourStatusTypeEnum } from '../enums/common.enum';
import { OrderTourEntity } from '../travel/entities/order-tour.entity';
import { UserResponse } from '../user/responses/user.response';
import { OrderTourResponse } from './responses/order-tour.response';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(TourEntity)
    private readonly tourRepo: Repository<TourEntity>,
    @InjectRepository(OrderTourEntity)
    private readonly orderTourRepo: Repository<OrderTourEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectDataSource()
    private readonly db: DataSource,
  ) {}

  async findAllUser() {
    const data = await this.userRepo.find({});

    return new UserResponse().mapToList(data);
  }

  async findAll(status: number) {
    const statusList =
      status === TourStatusTypeEnum.All
        ? [
            TourStatusTypeEnum.Ordered,
            TourStatusTypeEnum.Paymented,
            TourStatusTypeEnum.Confirmed,
            TourStatusTypeEnum.Done,
            TourStatusTypeEnum.Canceled,
          ]
        : [status];

    const data = await this.orderTourRepo
      .createQueryBuilder('buy_tour')
      .leftJoinAndSelect('buy_tour.tour', 'tour')
      .leftJoinAndSelect('buy_tour.user', 'user')
      .where('buy_tour.status IN (:...statusList)', {
        statusList: statusList,
      })
      .getMany();

    return new OrderTourResponse().mapToList(data);
  }

  async changeTourStatus(orderTourId: string, status: number) {
    await this.orderTourRepo.update(
      { order_tour_id: orderTourId },
      { status: status },
    );

    return true;
  }
}
