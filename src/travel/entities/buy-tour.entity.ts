import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from '../../models/base.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { TourEntity } from './tour.entity';

@Entity({
  name: 'buy_tour',
})
export class BuyTourEntity extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  buy_tour_id: string;

  @Column({
    type: 'int',
  })
  total_payment: number;

  @Column({
    type: 'int',
    default: 0,
  })
  status: number; // 0 - da dat, 1 - da xac nhan, 2 - hoan thanh

  @OneToOne(() => UserEntity, (user: UserEntity) => user.user_id)
  user: UserEntity;

  @OneToOne(() => TourEntity, (user: TourEntity) => user.travel_id)
  tour: TourEntity;
}
