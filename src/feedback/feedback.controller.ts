import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { GetUserIdFromToken } from '../utils/utils.decorators';
import { Response } from 'express';
import { BaseResponse } from '../utils/utils.response';
import { CatchException } from '../exceptions/common.exception';

@ApiTags('Feedback - API')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(AuthGuard)
  @Post(':tourId')
  async create(
    @Param('tourId') tourId: string,
    @GetUserIdFromToken() userId: number,
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.feedbackService.create(
        tourId,
        userId,
        createFeedbackDto,
      );
      return res
        .status(HttpStatus.OK)
        .send(new BaseResponse({ data, message: 'Thêm phản hồi thành công' }));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Get(':tourId')
  async findOne(@Param('tourId') tourId: string, @Res() res: Response) {
    try {
      const data = await this.feedbackService.findOne(tourId);

      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e);
    }
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.update(+id, updateFeedbackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(+id);
  }
}
