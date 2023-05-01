import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseModel } from './base.entity';
import { DistrictEntity } from './district.entity';

@Entity({
  database: 'user',
  name: 'ward',
})
export class WardEntity extends BaseModel {
  @PrimaryColumn({
    type: 'int',
    default: 0,
  })
  ward_id: number;

  @Column({
    type: 'int',
  })
  district_id: number;

  @Column({
    type: 'varchar',
    length: '50',
    default: '',
  })
  name: string;

  @ManyToOne(() => DistrictEntity, (district) => district.district_id)
  district: DistrictEntity;
}
