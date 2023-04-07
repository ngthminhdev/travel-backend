import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { BaseResponse } from "../utils/utils.response";
import { Response } from "express";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { UserResponseSwagger } from "../user/responses/user.response";
import { RefreshTokenSwagger } from "./responses/RefreshToken.response";
import { DeviceGuard } from "../guards/device.guard";
import { MRequest } from "../types/middleware";
import { CatchException } from "../exceptions/common.exception";
import { AdminGuard } from "../guards/admin.guard";
import { UserIdQueryDto } from "./dto/userIdQuery.dto";
import { GetDeviceId, GetUserIdFromToken } from "../utils/utils.decorators";
import { DeviceSessionSwagger } from "./responses/DeviceSession.response";

@ApiTags('Auth - API')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
    @ApiOperation({summary: 'Đăng ký tài khoản'})
    @ApiBody({type: RegisterDto})
    @ApiResponse({status: HttpStatus.CREATED, type: BaseResponse})
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() body: RegisterDto, @Res() res: Response) {
        try {
            const data = await this.authService.register(body);
            return res.status(HttpStatus.CREATED).send(new BaseResponse(data));
        } catch (e) {
            throw new CatchException(e)
        }
    }

    @ApiOperation({summary: 'Đăng nhập'})
    @ApiBody({type: LoginDto})
    @ApiResponse({status: HttpStatus.OK, type: UserResponseSwagger})
    @Post('login')
    async login(@Req() req: MRequest, @Body() loginDto: LoginDto, @Headers() headers: Headers, @Res() res: Response) {
        try {
            const data = await this.authService.login(req, loginDto, headers, res);
            return res.status(HttpStatus.OK).send(new BaseResponse({data}));
        } catch (e) {
            throw new CatchException(e)
        }
    };

    @ApiOperation({summary: 'Đăng xuất'})
    @ApiResponse({status: HttpStatus.OK, type: BaseResponse})
    @ApiBearerAuth()
    @UseGuards(DeviceGuard)
    @Post('logout')
    async logout(@GetUserIdFromToken() userId: number, @GetDeviceId() deviceId: string, @Res() res: Response) {
        try {
            const data = await this.authService.logout(userId, deviceId, res);
            return res.status(HttpStatus.OK).send(new BaseResponse(data));
        } catch (e) {
            throw new CatchException(e)
        }
    };

    @ApiOperation({summary: 'Làm mới access token'})
    @ApiResponse({status: HttpStatus.OK, type: RefreshTokenSwagger})
    @ApiBearerAuth()
    @ApiCookieAuth()
    @UseGuards(DeviceGuard)
    @Post('refresh-token')
    async refreshToken(@Req() req: MRequest, @Res() res: Response) {
        try {
            const data = await this.authService.refreshToken(req, res);
            return res.status(HttpStatus.OK).send(new BaseResponse({data}));
        } catch (e) {
            throw new CatchException(e)
        }
    };

    @ApiOperation({summary: 'Lấy các phiên đăng nhập'})
    @ApiResponse({status: HttpStatus.OK, type: DeviceSessionSwagger})
    @ApiBearerAuth()
    @UseGuards(AdminGuard)
    @Get('login-device-session')
    async getHistorySession(@Query() q: UserIdQueryDto, @Res() res: Response) {
        try {
            const data = await this.authService.getHistorySession(q.userId);
            return res.status(HttpStatus.OK).send(new BaseResponse({data}));
        } catch (e) {
            throw new CatchException(e)
        }
    };
}
