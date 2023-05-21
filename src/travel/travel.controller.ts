import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TravelService } from './travel.service';
import { CreateTravelDto } from './dto/create-travel.dto';
import { UpdateTravelDto } from './dto/update-travel.dto';
import { Response } from 'express';
import { CatchException } from '../exceptions/common.exception';
import { BaseResponse } from '../utils/utils.response';
import { AdminGuard } from '../guards/admin.guard';
import { AuthGuard } from '../guards/auth.guard';
import { BuyTourDto } from './dto/buy-tour.dto';
import { GetUserIdFromToken } from '../utils/utils.decorators';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Tour - API')
@Controller('travel')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @UseGuards(AdminGuard)
  @Post('add-tour')
  async create(@Body() createTravelDto: CreateTravelDto, @Res() res: Response) {
    try {
      const data = await this.travelService.create(createTravelDto);
      return res
        .status(HttpStatus.CREATED)
        .send(new BaseResponse({ data, message: 'Thêm tour thành công' }));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Get('get-all-tour')
  async findAll(@Res() res: Response) {
    try {
      const data = await this.travelService.findAll();
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Get('get-tour/:id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const data = await this.travelService.findOne(id);
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Get('search')
  async search(@Query('q') q: string, @Res() res: Response) {
    try {
      const data = await this.travelService.search(q);
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTravelDto: UpdateTravelDto) {
    return this.travelService.update(+id, updateTravelDto);
  }

  @UseGuards(AdminGuard)
  @Delete('remove/:id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      const message = await this.travelService.remove(id);
      return res.status(HttpStatus.OK).send(new BaseResponse({ message }));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @UseGuards(AuthGuard)
  @Post('order-tour/:tourId')
  async buyTour(
    @Param('tourId') tourId: string,
    @Body() buyTourDto: BuyTourDto,
    @GetUserIdFromToken() userId: number,
    @Res() res: Response,
  ) {
    try {
      const data = await this.travelService.buyTour(tourId, buyTourDto, userId);
      return res
        .status(HttpStatus.CREATED)
        .send(new BaseResponse({ data, message: 'Đặt tour thành công' }));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @UseGuards(AuthGuard)
  @Post('payment-tour/:tourId')
  async makePayment(
    @Param('tourId') tourId: string,
    @GetUserIdFromToken() userId: number,
    @Res() res: Response,
  ) {
    try {
      const data = await this.travelService.makePayment(tourId, userId);
      return res
        .status(HttpStatus.OK)
        .send(new BaseResponse({ data, message: 'Thanh toán thành công' }));
    } catch (e) {
      throw new CatchException(e);
    }
  }
}
