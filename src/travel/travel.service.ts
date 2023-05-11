import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import { CreateTravelDto } from './dto/create-travel.dto';
import { UpdateTravelDto } from './dto/update-travel.dto';
import { TourEntity } from './entities/tour.entity';
import { TourResponse } from './responses/tour.response';
import { BuyTourDto } from './dto/buy-tour.dto';
import { BuyTourEntity } from './entities/buy-tour.entity';
import { ExceptionResponse } from '../exceptions/common.exception';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class TravelService {
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
  async create(data: CreateTravelDto) {
    const tour: TourEntity = await this.tourRepo.save({
      tour_name: data.tourName,
      description: data.description,
      address: data.address,
      image: data.image,
      price: data.price,
      discount: data.discount,
      quantity: data.quantity,
      is_hotel: data.isHotel,
      is_car: data.isCar,
      is_airplane: data.isAirplane,
      start_place: data.startPlace,
      start_time: data.startTime,
    });

    return tour;
  }

  async findAll() {
    const data = await this.tourRepo.find({
      where: { is_deleted: false },
      order: { created_at: 'DESC' },
    });
    return new TourResponse().mapToList(data);
  }

  async findOne(id: string) {
    const data = await this.tourRepo.findOne({ where: { travel_id: id } });
    return new TourResponse(data);
  }

  update(id: number, updateTravelDto: UpdateTravelDto) {
    return `This action updates a #${id} travel`;
  }

  async remove(id: string) {
    await this.tourRepo.update(
      { travel_id: id },
      { deleted_at: new Date(), is_deleted: true },
    );
    return 'Xoá tour thành công';
  }

  async search(q: string) {
    const query: string = `
      SELECT * FROM tour WHERE
      to_tsvector('vietnamese', tour_name || ' ' || description) @@ to_tsquery('vietnamese', '${q
        .split(' ')
        .join(' | ')}') and is_deleted = false;
    `;

    const data = await this.db.query(query);

    return new TourResponse().mapToList(data);
  }

  async buyTour(tourId: string, data: BuyTourDto, userId: number) {
    const buyTour: BuyTourEntity = await this.buyTourRepo.findOneBy({
      tour: { travel_id: tourId },
    });

    if (buyTour) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Bạn đã đặt tour này rồi, chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất',
      );
    }

    const newBuyTour: BuyTourEntity = this.buyTourRepo.create({
      total_payment: data.totalPayment,
    });

    const user: UserEntity = await this.userRepo.findOneBy({ user_id: userId });

    if (!user) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Không tìm thấy người dùng',
      );
    }

    const tour: TourEntity = await this.tourRepo.findOneBy({
      travel_id: tourId,
    });

    if (!tour) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Không tìm thấy tour',
      );
    }

    newBuyTour.user = user;
    newBuyTour.tour = tour;

    await newBuyTour.save();

    return true;
  }
}
