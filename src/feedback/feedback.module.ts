import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment.entity';
import { RatingEntity } from './entities/rating.entity';
import { TourEntity } from '../travel/entities/tour.entity';
import { UserEntity } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { OrderTourEntity } from '../travel/entities/order-tour.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentEntity,
      TourEntity,
      UserEntity,
      OrderTourEntity,
    ]),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, JwtService],
})
export class FeedbackModule {}
