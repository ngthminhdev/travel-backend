import {Column, Entity, Generated, ManyToOne, PrimaryColumn,} from 'typeorm';
import {BaseModel} from '../../models/base.entity';
import {UserEntity} from '../../user/entities/user.entity';

@Entity({
    name: 'device',
})
export class DeviceEntity extends BaseModel {
    @PrimaryColumn({type: 'uuid'})
    @Generated('uuid')
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

    @ManyToOne(() => UserEntity, (user) => user.devices)
    user: UserEntity
}
