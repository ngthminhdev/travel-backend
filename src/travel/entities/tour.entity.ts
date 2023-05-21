import { CommentEntity } from '../../feedback/entities/comment.entity';
import { RatingEntity } from '../../feedback/entities/rating.entity';
import { BaseModel } from '../../models/base.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'tour',
})
export class TourEntity extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  travel_id: string;

  @Column({
    type: 'text',
    default: '',
  })
  tour_name: string;

  @Column({
    type: 'text',
    default: '',
  })
  description: string;

  @Column({
    type: 'text',
    default: '',
  })
  start_place: string;

  @Column({
    type: 'timestamp',
    default: () => 'now()',
  })
  start_time: Date | string;

  @Column({
    type: 'int',
  })
  quantity: number;

  @Column({
    type: 'int',
  })
  price: number;

  @Column({
    type: 'int',
  })
  discount: number;

  @Column({
    type: 'float',
    default: 0,
  })
  rating: number;

  @Column({
    type: 'float',
    default: 0,
  })
  number_of_rating: number;

  @Column({
    type: 'int',
    default: 0,
  })
  following: number;

  @Column({
    type: 'text',
    default:
      'resources/images/sale-1-616e4e7432c74dc-6aa68b9e-4aff22-97a479-459f86761ba4651e531a1615.webp',
  })
  image: string;

  @Column({
    type: 'text',
  })
  address: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_hotel: Boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_car: Boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_airplane: Boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_deleted: Boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  deleted_at: Date | string;

  @OneToMany(() => CommentEntity, (comment) => comment.comment_id)
  comments: CommentEntity[];
}
