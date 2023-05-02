import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
  database: 'user',
  name: 'district',
})
export class DistrictEntity extends BaseEntity {
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
}
