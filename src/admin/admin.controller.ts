import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';
import { CatchException } from '../exceptions/common.exception';
import { BaseResponse } from '../utils/utils.response';

// @UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('get-all-order-tour')
  async findAll(@Res() res: Response) {
    try {
      const data = await this.adminService.findAll();
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e);
    }
  }
}
