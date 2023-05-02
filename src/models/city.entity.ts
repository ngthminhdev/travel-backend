import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
  name: 'city',
})
export class CityEntity extends BaseEntity {
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
}
