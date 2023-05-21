import { IsEnum } from 'class-validator';

export class ChangeTourStatusDto {
  @IsEnum([0, 1, 2, 3, 4], { message: 'status not found' })
  status: number;
}
