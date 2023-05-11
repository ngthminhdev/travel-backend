import { IsNumber, IsString } from 'class-validator';

export class BuyTourDto {
  @IsString()
  touristName: string;

  @IsString()
  touristEmail: string;

  @IsString()
  touristPhone: string;

  @IsString()
  touristAddress: string;

  @IsNumber()
  touristNumber: number;

  @IsNumber()
  totalPayment: number;
}
