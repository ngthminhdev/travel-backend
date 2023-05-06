import { HttpStatus, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { ExceptionResponse } from "../exceptions/common.exception";

export const copyFileStream = async (source: string, target: string) => {
  const logger = new Logger('MoveFileDetectLogger');
  const rd = fs.createReadStream(source);
  const wr = fs.createWriteStream(target);
  try {
    return await new Promise((resolve, reject) => {
      rd.on('error', reject);
      wr.on('error', reject);
      wr.on('finish', resolve);
      rd.pipe(wr);
    });
  } catch (error) {
    rd.destroy();
    wr.end();
    logger.error(error);
    throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'Move file error!');
  }
};
