import { PartialType } from '@nestjs/swagger';
import { CreateAhpDto } from './create-ahp.dto';

export class UpdateAhpDto extends PartialType(CreateAhpDto) {}
