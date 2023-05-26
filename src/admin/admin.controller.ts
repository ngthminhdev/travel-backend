import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';
import { CatchException } from '../exceptions/common.exception';
import { BaseResponse } from '../utils/utils.response';
import { ChangeTourStatusDto } from './dto/change-tour-status.dto';
import { ApiTags } from '@nestjs/swagger';

// @UseGuards(AdminGuard)
@ApiTags('Admin - API')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('get-all-tour')
  async findAll(@Query('status') status: string, @Res() res: Response) {
    try {
      const data = await this.adminService.findAll(parseInt(status));
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Get('get-all-user')
  async findAllUser(@Res() res: Response) {
    try {
      const data = await this.adminService.findAllUser();
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Post('change-tour-status/:orderTourId')
  async changeTourOrder(
    @Param('orderTourId') orderTourId: string,
    @Body() body: ChangeTourStatusDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.adminService.changeTourStatus(
        orderTourId,
        body.status,
      );
      return res.status(HttpStatus.OK).send(
        new BaseResponse({
          data,
          message: 'Cập nhật trạng thái tour thành công',
        }),
      );
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Delete('remove/:userId')
  async removeUser(@Param('userId') userId: string, @Res() res: Response) {
    try {
      const data = await this.adminService.removeUser(parseInt(userId));
      return res.status(HttpStatus.OK).send(
        new BaseResponse({
          data,
          message: 'Xoá user thành công',
        }),
      );
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Post('update/:userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    try {
      const data = await this.adminService.updateUser(parseInt(userId), body);
      return res.status(HttpStatus.OK).send(
        new BaseResponse({
          data,
          message: 'Cập nhật user thành công',
        }),
      );
    } catch (e) {
      throw new CatchException(e);
    }
  }
}
