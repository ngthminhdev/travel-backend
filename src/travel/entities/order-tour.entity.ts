import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseModel } from '../../models/base.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { TourEntity } from './tour.entity';

@Entity({
  name: 'order_tour',
})
export class OrderTourEntity extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  order_tour_id: string;

  @Column({
    type: 'int',
  })
  total_payment: number;

  @Column({
    type: 'int',
    default: 0,
  })
  status: number; // 0 - da dat, 1 - da xac nhan, 2 - hoan thanh, 3 - da huy

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.user_id)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => TourEntity, (user: TourEntity) => user.travel_id)
  @JoinColumn({ name: 'travel_id' })
  tour: TourEntity;
}
