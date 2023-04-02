import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { FindOptionsWhere, Repository } from "typeorm";
import { CatchException, ExceptionResponse } from "../exceptions/common.exception";
import { Cache } from "cache-manager";
import { UserResponse } from "./responses/user.response";
import { RedisKeys } from "../enums/redis-keys.enum";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache
  ) {
  }

  async getInfo(userId: number): Promise<UserResponse> {
    const redisData: UserResponse = await this.redis.get(`${RedisKeys.User}:${userId}`);
    if (redisData) return redisData;
    const user: UserEntity = await this.userRepo.findOne({ where: { user_id: userId } });
    if (!user) throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "user not found");
    const mappedData = new UserResponse(user);
    await this.redis.set(`${RedisKeys.User}:${userId}`, mappedData);
    return mappedData;
  }

  async delete(criteria: FindOptionsWhere<UserEntity> = {}): Promise<void> {
    try {
      await this.userRepo.delete(criteria);
    } catch (e) {
      throw new CatchException(e);
    }
  }
}
