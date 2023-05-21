import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseModel } from '../../models/base.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({
  name: 'rating',
})
export class RatingEntity extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  rating_id: string;

  @Column({
    type: 'float',
    default: 0,
  })
  rating: number;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.user_id)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
