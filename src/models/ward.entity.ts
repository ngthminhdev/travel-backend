import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
  database: 'user',
  name: 'ward',
})
export class WardEntity extends BaseEntity {
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
}
