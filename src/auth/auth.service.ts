import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { FindOptionsWhere, Repository } from "typeorm";
import { CatchException, ExceptionResponse } from "../exceptions/common.exception";
import { UserResponse } from "../user/responses/user.response";
import { UserEntity } from "../user/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { Response } from "express";
import { BooleanEnum, TimeToLive } from "../enums/common.enum";
import { DeviceEntity } from "./entities/device.entity";
import { MRequest } from "../types/middleware";
import { randomUUID } from "crypto";
import { UtilCommonTemplate } from "../utils/utils.common";
import { RefreshTokenResponse } from "./responses/RefreshToken.response";
import { DeviceLoginInterface } from "./interfaces/device-login.interface";
import { DeviceSessionResponse } from "./responses/DeviceSession.response";
import { BaseResponse } from "../utils/utils.response";
import { VerifyEntity } from "./entities/verify.entity";
import { SmsService } from "../sms/sms.service";
import { QueueService } from "../queue/queue.service";
import { RedisKeys } from "../enums/redis-keys.enum";
import { Cache } from "cache-manager";
import { RegisterResponse } from "./responses/Register.response";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepo: Repository<DeviceEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(VerifyEntity)
    private readonly verifyRepo: Repository<VerifyEntity>,
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
    private readonly queueService: QueueService

  ) {
  }

  generateAccessToken(userId: number, role: number, deviceId: string, secretKey: string): string {
    return this.jwtService.sign({
      userId: userId,
      role: role,
      deviceId: deviceId
    }, {
      secret: secretKey,
      expiresIn: TimeToLive.OneHour
    });
  }

  generateRefreshToken(userId: number, deviceId: string): string {
    return this.jwtService.sign({
      userId: userId,
      deviceId: deviceId
    }, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: TimeToLive.OneWeek
    });
  }

  async register(data: RegisterDto): Promise<RegisterResponse> {
    const user: UserEntity = await this.userRepo.findOne({
      where: { account_name: data.accountName }
    });
    if (user) {
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "accountName is already registered");
    }
    const saltOrRounds = 10;
    const hash: string = await bcrypt.hash(data.password, saltOrRounds);
    const newUser: UserEntity = await this.userRepo.save({
      ...data,
      password: hash
    });
    // Gửi một OTP đến người dùng mới đăng ký
    await this.sendOTP(newUser);

    // Lưu thông tin người dùng mới vào Redis để sử dụng trong các yêu cầu sau này
    await this.redis.set(`${RedisKeys.User}:${newUser.user_id}`, new UserResponse(newUser));

    // Trả về đối tượng RegisterResponse với thông tin người dùng mới được đăng ký thành công
    return new RegisterResponse(newUser);
  }

  async login(req: MRequest, loginDto: LoginDto, headers: Headers, res: Response): Promise<UserResponse> {
    const { account_name, password } = loginDto;
    const user: UserEntity = await this.userRepo.findOne({ where: { account_name } });
    if (!user) {
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "account_name is not registered");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "account_name or password is not correct");
    }

    // Lấy thông tin Device ID, địa chỉ IP và User Agent
    const deviceId: string = req.deviceId;
    const ipAddress: string = req.realIP || req.ip || req.socket.remoteAddress;
    const userAgent: string = headers["user-agent"];

    // Xử lý phiên đăng nhập của thiết bị
    const {
      accessToken,
      refreshToken,
      expiredAt
    } = await this.handleDeviceSession(user, deviceId, ipAddress, userAgent);

    // Lưu cookie refreshToken
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/"
    });

    // Trả về thông tin người dùng kèm access token và thời gian hết hạn
    return new UserResponse({
      ...user,
      access_token: accessToken,
      expired_at: expiredAt
    });
  }

  async handleDeviceSession(user: UserEntity, deviceId: string, ipAddress: string, userAgent: string): Promise<DeviceLoginInterface> {
    // Tìm kiếm thiết bị hiện tại theo device_id
    const currentDevice = await this.deviceRepo.findOne({ where: { device_id: deviceId } });

    // Tạo secretKey ngẫu nhiên bằng uuid
    const secretKey: string = UtilCommonTemplate.uuid();

    // Tạo accessToken, refreshToken và expiredAt mới
    const accessToken: string = this.generateAccessToken(user.user_id, user.role, deviceId, secretKey);
    const refreshToken: string = this.generateRefreshToken(user.user_id, deviceId);
    const expiredAt: Date = new Date(Date.now() + TimeToLive.OneDayMilliSeconds);

    // Lưu thông tin của thiết bị mới vào database
    const newDevice = await this.deviceRepo.save({
      id: currentDevice?.id || randomUUID(),
      user: user,
      device_id: deviceId,
      user_agent: userAgent,
      expired_at: expiredAt,
      ip_address: ipAddress,
      secret_key: secretKey,
      refresh_token: refreshToken
    });

    // Thêm thiết bị mới vào danh sách các thiết bị của user
    user.devices?.push(newDevice);
    await this.userRepo.save(user);

    // Trả về accessToken, refreshToken và expiredAt mới
    return { accessToken, refreshToken, expiredAt };
  }

  async logout(userId: number, deviceId: string, res: Response): Promise<BaseResponse> {
    const currentSession: DeviceEntity = await this.deviceRepo
      .createQueryBuilder("device")
      .leftJoinAndSelect("device.user", "user")
      .select(["device", "user.user_id"])
      .where("device.device_id = :deviceId", { deviceId })
      .andWhere("user.user_id = :userId", { userId })
      .getOne();

    if (!currentSession || currentSession.user.user_id !== userId) {
      throw new ExceptionResponse(HttpStatus.FORBIDDEN, "you are not allow to do that");
    }

    res.cookie("refreshToken", "", {
      maxAge: -1,
      path: "/",
      httpOnly: true
    });

    await this.deviceRepo.delete({ device_id: deviceId });
    return { status: HttpStatus.OK, message: "logged out successfully", data: null };
  }

  async refreshToken(req: MRequest, res: Response): Promise<RefreshTokenResponse> {
    // Lấy refresh token từ cookies của request
    const refreshToken: string = req?.cookies?.["refreshToken"];
    if (!refreshToken) {
      // Nếu không tìm thấy refresh token trong cookies thì trả về lỗi BAD_REQUEST
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "refresh token not found");
    }
    // Lấy deviceId từ request
    const deviceId: string = req.deviceId;

    // Tìm kiếm device hiện tại trong database theo refreshToken và deviceId
    const currentDevice: DeviceEntity = await this.deviceRepo
      .createQueryBuilder("device")
      .select("device", "user.user_id")
      .leftJoinAndSelect("device.user", "user")
      .where("device.refresh_token = :refreshToken", { refreshToken })
      .andWhere("device.device_id = :deviceId", { deviceId })
      .getOne();

    if (!currentDevice) {
      // Nếu không tìm thấy device trong database thì trả về lỗi BAD_REQUEST
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "refresh token is not valid");
    }
    // Lấy thời gian hết hạn của refreshToken
    const refreshExpired: number = (this.jwtService.decode(refreshToken))?.["exp"];
    if (refreshExpired < new Date().valueOf() / 1000) {
      // Nếu refreshToken đã hết hạn thì trả về lỗi BAD_REQUEST
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "refresh token is not valid");
    }

    if (!this.jwtService.verify(refreshToken, { secret: process.env.REFRESH_TOKEN_SECRET })) {
      // Nếu refreshToken không hợp lệ thì trả về lỗi BAD_REQUEST
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "refresh token is not valid");
    }

    // Tạo secretKey mới để sử dụng cho accessToken
    const secretKey = UtilCommonTemplate.uuid();
    // Tạo accessToken mới
    const newAccessToken: string = this.generateAccessToken(currentDevice.user.user_id, currentDevice.user.role, deviceId, secretKey);
    // Tạo refreshToken mới
    const newRefreshToken: string = this.generateRefreshToken(currentDevice.user.user_id, deviceId);

    // Lưu refreshToken mới vào cookies của response
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      path: "/"
    });
    // Cập nhật thông tin của device trong database
    await this.deviceRepo.update({ device_id: deviceId },
      {
        secret_key: secretKey,
        refresh_token: newRefreshToken,
      });
    // Trả về đối tượng RefreshTokenResponse cho client
    return new RefreshTokenResponse({
      access_token: newAccessToken,
    });
  }

  async getVerifyOTP(userId: number): Promise<string> {
    // Tìm VerifyEntity với user_id được cung cấp
    const verifyEntity: VerifyEntity = await this.verifyRepo.createQueryBuilder("verify_otp")
      .leftJoinAndSelect("verify_otp.user", "user")
      .where("verify_otp.user_id = :userId", { userId })
      .getOne();

    // Nếu VerifyEntity đã tồn tại, throw một ExceptionResponse với mã lỗi BAD_REQUEST
    if (verifyEntity) throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "please wait, and try again later");

    const user: UserEntity = await this.userRepo.findOne({where: { user_id: userId }})

    if (!user) throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "invalid request");

    // Gửi một OTP mới đến người dùng
    await this.sendOTP(user);

    // Trả về một thông báo cho người dùng cho biết đã gửi thành công một OTP mới đến số điện thoại của họ
    return "sent an OTP to your phone number";
  }

  async verifyOTP(userId: number, verifyOTP: string): Promise<string> {
    // Tìm VerifyEntity với user_id và verify_otp được cung cấp
    const verifyEntity: VerifyEntity = await this.verifyRepo.createQueryBuilder("verify_otp")
      .leftJoinAndSelect("verify_otp.user", "user")
      .where("verify_otp.user_id = :userId", { userId })
      .andWhere("verify_otp.verify_otp = :verifyOTP", { verifyOTP })
      .getOne();

    // Nếu VerifyEntity không tồn tại, throw một ExceptionResponse với mã lỗi BAD_REQUEST
    if (!verifyEntity) throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "OTP is not valid");

    // Xóa VerifyEntity đã được sử dụng và cập nhật is_verified của UserEntity tương ứng
    await this.verifyRepo.delete({ id: verifyEntity.id });
    await this.userRepo.update({ user_id: userId }, { is_verified: BooleanEnum.True });

    // Cập nhật Redis cache nếu UserEntity đã được lưu trữ trong cache
    const userRedis: UserResponse = await this.redis.get(`${RedisKeys.User}:${userId}`);
    if (userRedis) await this.redis.set(`${RedisKeys.User}:${userId}`, { ...userRedis, is_verified: BooleanEnum.True });

    // Trả về một thông báo cho người dùng cho biết tài khoản của họ đã được xác thực thành công
    return "your account is verified successfully";
  }

  async sendOTP(user: UserEntity): Promise<void> {
    // Tạo mã OTP ngẫu nhiên
    const verifyOTP: string = UtilCommonTemplate.generateOTP();

    // Gửi tin nhắn SMS chứa mã OTP đến số điện thoại của người dùng (có thời hạn 5 phút)
    await this.smsService.sendSMS(user.phone, `Your OTP is: ${verifyOTP} (5 minutes)`);

    // Lưu mã OTP vào cơ sở dữ liệu và đặt một công việc trong hàng đợi để xóa mã OTP sau 5 phút
    const verifyData: VerifyEntity = await this.verifyRepo.save({
      user_id: user.user_id,
      user: user,
      verify_otp: verifyOTP
    });
    await this.queueService.addJob("delete-expired-otp", verifyData, TimeToLive.FiveMinutesMilliSeconds);
  }

  async getSecretKey(deviceId: string): Promise<Pick<DeviceEntity, "secret_key" | "expired_at">> {
    return (await this.deviceRepo.findOne({
        where: { device_id: deviceId },
        select: ["secret_key", "expired_at"]
      })
    )
  }

  async getHistorySession(userId: number) {
    const data: DeviceEntity[] = await this.deviceRepo
      .createQueryBuilder("device")
      .innerJoinAndSelect("device.user", "user")
      .where("user.user_id = :userId", { userId })
      .getMany();

    return new DeviceSessionResponse().mapToList(data);
  }

  async delete(criteria: FindOptionsWhere<DeviceEntity> = {}): Promise<void> {
    try {
      await this.deviceRepo.delete(criteria);
    } catch (e) {
      throw new CatchException(e);
    }
  }

}