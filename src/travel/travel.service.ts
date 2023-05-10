import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateTravelDto } from './dto/create-travel.dto';
import { UpdateTravelDto } from './dto/update-travel.dto';
import { TourEntity } from './entities/tour.entity';
import { TourResponse } from './responses/tour.response';

@Injectable()
export class TravelService {
  constructor(
    @InjectRepository(TourEntity)
    private readonly TourRepo: Repository<TourEntity>,
  ) {}
  async create(data: CreateTravelDto) {
    const tour: TourEntity = await this.TourRepo.save({
      tour_name: data.tourName,
      description: data.description,
      address: data.address,
      image: data.image,
      price: data.price,
      discount: data.discount,
      quantity: data.quantity,
      is_hotel: data.isHotel,
      is_car: data.isCar,
      is_airplane: data.isAirplane,
      start_place: data.startPlace,
      start_time: data.startTime,
    });

    return tour;
  }

  async findAll() {
    const data = await this.TourRepo.find({
      where: { is_deleted: false },
      order: { created_at: 'DESC' },
    });
    return new TourResponse().mapToList(data);
  }

  async findOne(id: string) {
    const data = await this.TourRepo.findOne({ where: { travel_id: id } });
    return new TourResponse(data);
  }

  update(id: number, updateTravelDto: UpdateTravelDto) {
    return `This action updates a #${id} travel`;
  }

  async remove(id: string) {
    await this.TourRepo.update(
      { travel_id: id },
      { deleted_at: new Date(), is_deleted: true },
    );
    return 'Xoá tour thành công';
  }

  async search(q: string) {
    const data = await this.TourRepo.createQueryBuilder('tour')
      .where('tour.tour_name ILike :searchTerm', {
        searchTerm: `%${q}%`,
      })
      .orWhere('tour.description ILike :searchTerm2', {
        searchTerm2: `%${q}%`,
      })
      .getMany();

    return new TourResponse().mapToList(data);
  }
}
