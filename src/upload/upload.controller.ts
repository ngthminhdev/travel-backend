import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FormDataRequest } from 'nestjs-form-data';
import { CreateUploadDto } from './dto/create-upload.dto';
import { Response } from 'express';
import { CatchException } from '../exceptions/common.exception';
import { BaseResponse } from '../utils/utils.response';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @FormDataRequest()
  async handleUploadFile(
    @Body() uploadBody: CreateUploadDto,
    @Res() res: Response,
  ) {
    try {
      console.log(
        '🚀 ~ file: upload.controller.ts:17 ~ UploadController ~ handleUploadFile ~ uploadBody:',
        uploadBody,
      );
      const data = await this.uploadService.handleUploadFile(uploadBody.file);
      return res
        .status(HttpStatus.CREATED)
        .send(new BaseResponse({ data, message: 'Upload thành công' }));
    } catch (e) {
      throw new CatchException(e);
    }
  }
}
