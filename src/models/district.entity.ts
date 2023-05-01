import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { BaseModel } from './base.entity';
import { WardEntity } from "./ward.entity";
import { CityEntity } from "./city.entity";

@Entity({
  database: 'user',
  name: 'district',
})
export class DistrictEntity extends BaseModel {
  @PrimaryColumn({
    type: 'int',
  })
  district_id: number;

  @Column({
    type: 'int',
    default: 0,
  })
  city_id: number;

  @Column({
    type: 'varchar',
    length: '50',
    default: '',
  })
  name: string;

  @ManyToOne(() => CityEntity, (city) => city.city_id)
  city: CityEntity;

  @OneToMany(() => WardEntity, (ward) => ward.ward_id)
  wards: WardEntity[];

}
