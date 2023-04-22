import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity } from './entities/device.entity';
import { UserEntity } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { VerifyEntity } from "./entities/verify.entity";
import { BullModule } from "@nestjs/bull";
import { QueueEnum } from "../enums/queue.enum";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { SmsService } from "../sms/sms.service";
import { QueueService } from "../queue/queue.service";
import { PhoneNumberInterceptor } from "../interceptors/phone-number.interceptor";

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceEntity, UserEntity, VerifyEntity]),
    //queue
    BullModule.registerQueue(
      {name: QueueEnum.MainProcessor}
    )],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: PhoneNumberInterceptor
    },
    AuthService, JwtService, SmsService, QueueService
  ],
})
export class AuthModule {}
