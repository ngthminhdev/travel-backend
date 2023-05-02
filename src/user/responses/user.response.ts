import { ApiResponseProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';
import {UtilCommonTemplate} from "../../utils/utils.common";

export class UserResponse {
  @ApiResponseProperty({
    type: Number,
    example: 1,
  })
  userId: number;

  @ApiResponseProperty({
    type: String,
    example: 'foo@gmail.com',
  })
  email: string;

  @ApiResponseProperty({
    type: String,
    example: 'Đặng Kim Liên',
  })
  username: string;

  @ApiResponseProperty({
    type: String,
    example:
      'https://vuipet.com/wp-content/uploads/2021/05/cho-corgi-gia-1.jpg',
  })
  avatar: string;

  @ApiResponseProperty({
    type: Date,
    example: '01/01/2000',
  })
  dateOfBirth: string | Date;

  @ApiResponseProperty({
    type: String,
    example: '84325166655',
  })
  phone: string;

  @ApiResponseProperty({
    type: Number,
    example: 0,
  })
  isVerified: number;

  @ApiResponseProperty({
    type: Number,
    example: 0,
  })
  role: number;

  @ApiResponseProperty({
    type: String,
    example: 'Texas, American',
  })
  address: string;

  @ApiResponseProperty({
    type: String,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  accessToken: string;

  @ApiResponseProperty({
    type: Date
  })
  expiredAt: Date | string

  constructor(data?: UserResponse | any) {
    this.userId = data?.user_id ?? 0;
    this.email = data?.email ?? '';
    this.username = data?.username ?? '';
    this.avatar = data?.avatar ?? '';
    this.dateOfBirth = UtilCommonTemplate.toDateTime(data?.date_of_birth) ?? '';
    this.phone = data?.phone ?? 0;
    this.isVerified = data?.is_verified ?? 0;
    this.role = data?.role ?? 0;
    this.address = data?.address ?? '';
    this.accessToken = data?.access_token ?? '';
    this.expiredAt = UtilCommonTemplate.toDateTime(data?.expired_at || new Date);
  }

  public mapToList(data?: UserResponse[] | any[]): UserResponse[] {
    return data.map((item) => new UserResponse(item));
  }
}

/**
 * extends lại BaseRespone
 */

export class UserResponseSwagger extends PartialType(BaseResponse) {
  @ApiResponseProperty({
    type: UserResponse,
  })
  data: UserResponse;
}
