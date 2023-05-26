import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateTravelDto {
  @IsString()
  tourName: string;

  @IsString()
  description: string;

  image: string;

  @IsString()
  startPlace: string;

  @IsString()
  startTime: string;

  @IsNumber()
  price: number;

  @IsNumber()
  discount: number;

  @IsNumber()
  quantity: number;

  @IsBoolean()
  isHotel: Boolean;

  @IsBoolean()
  isCar: Boolean;

  @IsBoolean()
  isAirplane: Boolean;
}
