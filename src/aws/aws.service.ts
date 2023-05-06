import {
  PutObjectCommand,
  PutObjectCommandInputType,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { FileInterface } from '../upload/interfaces/file';
import { CatchException } from '../exceptions/common.exception';
import { UtilCommonTemplate } from '../utils/utils.common';

@Injectable()
export class AwsService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });
    this.bucket = process.env.AWS_S3_BUCKET;
  }

  async uploadFileToS3(file: FileInterface): Promise<string> {
    try {
      const fileKey = `travel/${UtilCommonTemplate.uuid()}-${
        file.originalName
      }`;
      const params: PutObjectCommandInputType = {
        Bucket: this.bucket,
        Key: fileKey,
        Body: file.buffer,
        ACL: 'public-read',
      };

      await this.s3Client.send(new PutObjectCommand(params));
      const url = `https://${this.bucket}.s3.amazonaws.com/${fileKey}`;
      return url;
    } catch (error) {
      throw new CatchException(error);
    }
  }
}
