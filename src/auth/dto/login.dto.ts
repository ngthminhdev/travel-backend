import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginDto {
  @IsString({message: 'account_name not found'})
  @ApiProperty({
    type: String,
    example: 'tentaikhoan',
  })
  account_name: string;

  @IsString({message: 'password not found'})
  @ApiProperty({
    type: String,
    example: 'abc123',
  })
  password: string;
}
