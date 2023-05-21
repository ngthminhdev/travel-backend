import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from '../../models/base.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({
  name: 'device',
})
export class DeviceEntity extends BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    default: '',
  })
  device_id: string;

  @Column({
    type: 'text',
    default: '',
  })
  user_agent: string;

  @Column({
    type: 'text',
    default: '',
  })
  secret_key: string;

  @Column({
    type: 'text',
    default: '',
  })
  refresh_token: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  expired_at: Date;

  @Column({
    type: 'text',
    default: '',
  })
  ip_address: string;

  @Column({
    type: 'text',
    default: '',
  })
  mac: string;

  @ManyToOne(() => UserEntity, (user) => user.devices)
  user: UserEntity;
}
