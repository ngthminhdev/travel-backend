import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourStatusTypeEnum } from '../enums/common.enum';
import { ExceptionResponse } from '../exceptions/common.exception';
import { OrderTourEntity } from '../travel/entities/order-tour.entity';
import { TourEntity } from '../travel/entities/tour.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { CommentEntity } from './entities/comment.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepo: Repository<CommentEntity>,
    @InjectRepository(TourEntity)
    private readonly tourRepo: Repository<TourEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(OrderTourEntity)
    private readonly orderTourRepo: Repository<OrderTourEntity>,
  ) {}

  async create(tourId: string, userId: number, body: CreateFeedbackDto) {
    const { content, rating } = body;

    const checkOrderTour = await this.orderTourRepo.findOneBy({
      user: { user_id: userId },
      tour: { travel_id: tourId },
      status: TourStatusTypeEnum.Paymented,
    });

    if (!checkOrderTour) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Bạn cần hoàn thành chuyến đi trước khi đưa ra phản hồi',
      );
    }

    const comment = await this.commentRepo.findOneBy({
      user: { user_id: userId },
      tour: { travel_id: tourId },
    });

    if (comment) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Bạn đã phản hồi tour này trước đây rồi',
      );
    }

    const tour = await this.tourRepo.findOneBy({ travel_id: tourId });

    if (!tour) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Không tìm thấy tour',
      );
    }

    const user: UserEntity = await this.userRepo.findOneBy({
      user_id: userId,
    });

    if (!user) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Không tìm thấy người dùng',
      );
    }

    const newComment = await this.commentRepo.save({
      content: content,
      rating: rating,
      parent: null,
      tour: tour,
      user: user,
    });

    tour.comments?.push(newComment);
    tour.number_of_rating = tour.number_of_rating + 1;
    tour.rating = tour.rating + rating;

    await this.tourRepo.save(tour);

    return null;
  }

  async findOne(tourId: string) {
    return await this.commentRepo.find({
      where: { tour: { travel_id: tourId } },
      relations: ['user'],
    });
  }

  update(id: number, updateFeedbackDto: UpdateFeedbackDto) {
    return `This action updates a #${id} feedback`;
  }

  remove(id: number) {
    return `This action removes a #${id} feedback`;
  }
}
