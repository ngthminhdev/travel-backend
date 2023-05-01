import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { BaseModel } from './base.entity';
import { DistrictEntity } from './district.entity';

@Entity({
  name: 'city',
})
export class CityEntity extends BaseModel {
  @PrimaryColumn({
    type: 'int',
  })
  city_id: number;

  @Column({
    type: 'int',
    default: 0,
  })
  country_id: number;

  @Column({
    type: 'varchar',
    length: '50',
    default: '',
  })
  name: string;

  @OneToMany(() => DistrictEntity, (district) => district.district_id)
  districts: DistrictEntity[];
}
