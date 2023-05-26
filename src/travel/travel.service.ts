import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import { CreateTravelDto } from './dto/create-travel.dto';
import { UpdateTravelDto } from './dto/update-travel.dto';
import { TourEntity } from './entities/tour.entity';
import { TourResponse } from './responses/tour.response';
import { BuyTourDto } from './dto/buy-tour.dto';
import { ExceptionResponse } from '../exceptions/common.exception';
import { UserEntity } from '../user/entities/user.entity';
import { OrderTourEntity } from './entities/order-tour.entity';
import { TourStatusTypeEnum } from '../enums/common.enum';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class TravelService {
  constructor(
    @InjectRepository(TourEntity)
    private readonly tourRepo: Repository<TourEntity>,
    @InjectRepository(OrderTourEntity)
    private readonly orderTourRepo: Repository<OrderTourEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectDataSource()
    private readonly db: DataSource,
    private readonly smsService: SmsService,
  ) {}
  async create(data: CreateTravelDto) {
    const tour: TourEntity = await this.tourRepo.save({
      tour_name: data.tourName,
      description: data.description,
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

    return new TourResponse(tour);
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
    const orderTour: OrderTourEntity = await this.orderTourRepo.findOneBy({
      tour: { travel_id: tourId },
    });

    if (orderTour) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Lỗi!!! Bạn đã đặt tour trước đó. Không thể đặt đơn lần 2',
      );
    }

    const newOrderTour: OrderTourEntity = this.orderTourRepo.create({
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

    newOrderTour.user = user;
    newOrderTour.tour = tour;

    await this.orderTourRepo.save(newOrderTour);

    return true;
  }

  async makePayment(tourId: string, userId: number) {
    const orderTour = await this.orderTourRepo.findOne({
      where: {
        tour: { travel_id: tourId },
        user: { user_id: userId },
      },
      relations: ['user', 'tour'],
    });

    if (orderTour.user.user_id !== userId) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Yêu cầu không hợp lệ',
      );
    }

    if (!orderTour) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Không tìm thấy đơn hàng',
      );
    }

    await this.orderTourRepo.update(
      { order_tour_id: orderTour.order_tour_id },
      {
        status: TourStatusTypeEnum.Paymented,
      },
    );
    const tourIdSMS: string = orderTour.tour.travel_id;
    const userPhone: string = orderTour.user.phone;

    await this.smsService.sendSMS(
      userPhone,
      `Quy khach vua thuc hien thanh toan tour ${tourIdSMS}. Cam on ban da chon dich vu KhanhhoaTravel. Chung toi se lien he ban trong thoi gian som nhat. Xin cam on`,
    );

    return true;
  }
}
