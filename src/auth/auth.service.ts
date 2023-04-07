import { HttpStatus, Injectable } from "@nestjs/common";
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
import { TimeToLive } from "../enums/common.enum";
import { DeviceEntity } from "./entities/device.entity";
import { MRequest } from "../types/middleware";
import { randomUUID } from "crypto";
import { UtilCommonTemplate } from "../utils/utils.common";
import { RefreshTokenResponse } from "./responses/RefreshToken.response";
import { DeviceLoginInterface } from "./interfaces/device-login.interface";
import { DeviceSessionResponse } from "./responses/DeviceSession.response";
import { BaseResponse } from "../utils/utils.response";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepo: Repository<DeviceEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService
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

  async register(data: RegisterDto): Promise<BaseResponse> {
    const user = await this.userRepo.findOne({
      where: { account_name: data.account_name }
    });
    if (user) {
      throw new ExceptionResponse(HttpStatus.BAD_REQUEST, "account_name is already registered");
    }
    const saltOrRounds = 10;
    const hash: string = await bcrypt.hash(data.password, saltOrRounds);
    await this.userRepo.save({
      ...data,
      password: hash
    });

    return { status: HttpStatus.CREATED, message: "register successfully", data: null };
  }

  async login(req: MRequest, loginDto: LoginDto, headers: Headers, res: Response): Promise<UserResponse> {
    const { account_name, password } = loginDto;
    const user = await this.userRepo.findOne({ where: { account_name } });
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
    const expiredAt: Date = new Date(Date.now() + TimeToLive.OneDayMiliSeconds);

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