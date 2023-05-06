import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'resources',
})
export class ResourcesEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
  })
  id: number;

  @Column({
    type: 'text',
    default: '',
  })
  file_name: string;

  @Index()
  @Column({
    type: 'smallint',
    default: 1, // 0 - unkeep, 1 - keep
  })
  is_keep: number;

  @Column({
    type: 'smallint',
    default: 0, // 0 - image, 1 - video, 2 - file
  })
  type: number;

  @Column({
    type: 'int',
    default: 0,
  })
  size: number;

  @Index()
  @Column({
    type: 'text',
    default: '',
  })
  path: string;

  @Column({
    type: 'text',
    default: '',
  })
  encoding: string;

  @Column({
    type: 'text',
    default: '',
  })
  ext: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
