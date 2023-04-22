import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeviceEntity } from "../auth/entities/device.entity";
import { UserEntity } from "./entities/user.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "../auth/auth.service";
import { VerifyEntity } from "../auth/entities/verify.entity";
import { BullModule } from "@nestjs/bull";
import { QueueEnum } from "../enums/queue.enum";
import { SmsService } from "../sms/sms.service";
import { QueueService } from "../queue/queue.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, DeviceEntity, VerifyEntity]),
    //queue
    BullModule.registerQueue(
      { name: QueueEnum.MainProcessor }
    )],
  controllers: [UserController],
  providers: [UserService, JwtService, AuthService, SmsService, QueueService]
})
export class UserModule {
}
