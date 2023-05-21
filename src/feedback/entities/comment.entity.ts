import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseModel } from '../../models/base.entity';
import { TourEntity } from '../../travel/entities/tour.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({
  name: 'comment',
})
export class CommentEntity extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  comment_id: string;

  @ManyToOne(() => CommentEntity, { nullable: true })
  @JoinColumn({ name: 'parrent_id' })
  parent: CommentEntity;

  @Column({
    type: 'text',
    default: '',
  })
  content: string;

  @Column({
    type: 'float',
    default: 0,
  })
  rating: number;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.user_id)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => TourEntity, (tour: TourEntity) => tour.comments)
  tour: TourEntity;
}
