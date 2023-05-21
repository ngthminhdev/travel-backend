import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExceptionResponse } from '../exceptions/common.exception';
import { MRequest } from '../types/middleware';
import { Repository } from 'typeorm';
import { OrderTourEntity } from '../travel/entities/order-tour.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BuyTourGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(OrderTourEntity)
    private readonly orderTourRepo: Repository<OrderTourEntity>,
  ) {}

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
