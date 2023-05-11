import { Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { TourEntity } from '../travel/entities/tour.entity';
import { DataSource, Repository } from 'typeorm';
import { BuyTourEntity } from '../travel/entities/buy-tour.entity';
import { UserEntity } from '../user/entities/user.entity';
import { TourStatusTypeEnum } from '../enums/common.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(TourEntity)
    private readonly tourRepo: Repository<TourEntity>,
    @InjectRepository(BuyTourEntity)
    private readonly buyTourRepo: Repository<BuyTourEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectDataSource()
    private readonly db: DataSource,
  ) {}

  async findAll() {
    const data = await this.buyTourRepo
      .createQueryBuilder('buy_tour')
      .leftJoinAndSelect('buy_tour.tour', 'tour')
      .leftJoinAndSelect('buy_tour.user', 'user')
      .where('buy_tour.status = :status', {
        status: TourStatusTypeEnum.Ordered,
      })
      .getMany();

    return data;
  }

  async changeTourOrder(buyTourId: string, data: any) {
    const buyTour = await this.buyTourRepo.findOneBy({
      buy_tour_id: buyTourId,
    });
  }
}
