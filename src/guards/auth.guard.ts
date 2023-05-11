import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExceptionResponse } from '../exceptions/common.exception';
import { MRequest } from '../types/middleware';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: MRequest = context.switchToHttp().getRequest();
    const bearer: string = request.headers.authorization;
    const token: string = bearer?.split(' ')![1];
    if (!bearer || !token) {
      throw new ExceptionResponse(
        HttpStatus.UNAUTHORIZED,
        'Yêu cầu không hợp lệ',
      );
    }

    return true;
  }
}
