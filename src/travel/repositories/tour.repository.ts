import { DataSource, Repository } from 'typeorm';
import { TourEntity } from '../entities/tour.entity';

export class TourRepository extends Repository<TourEntity> {
  constructor(private readonly DataSource: DataSource) {
    super(TourEntity, DataSource.manager);
  }
}
