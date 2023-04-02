import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import {BaseModel} from '../../models/base.entity';
import { DeviceEntity } from "../../auth/entities/device.entity";

@Entity({
  name: 'user',
})
export class UserEntity extends BaseModel {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
  })
  user_id: number;

  @Column({
    type: 'text',
    default: '',
  })
  username: string;

  @Index()
  @Column({
    type: 'text',
    default: '',
  })
  email: string;

  @Index()
  @Column({
    type: 'text',
    default: '',
  })
  account_name: string;

  @Column({
    type: 'text',
    default: '',
  })
  password: string;

  @Column({
    type: 'text',
    default: '',
  })
  avatar: string;

  @Column({
    type: 'date',
    default: '2000/01/01',
  })
  date_of_birth: Date;

  @Index()
  @Column({
    type: 'text',
    default: '',
  })
  phone: string;

  /**
   * Tài Khoản đã xác minh email hay chưa: 0 - chưa, 1 - rồi
   */
  @Column({
    type: 'smallint',
    default: 0,
  })
  is_verified: number;

  @Column({
    type: 'smallint',
    default: 0, //0 - user, 1 - admin
  })
  role: number;

  @Column({
    type: 'text',
    default: '',
  })
  address: string;

  @OneToMany(() => DeviceEntity, (device) => device.device_id)
  devices: DeviceEntity[];
}
