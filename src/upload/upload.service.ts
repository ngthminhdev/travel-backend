import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AwsService } from '../aws/aws.service';
import { ResourceTypeEnum } from '../enums/common.enum';
import { ResourcesEntity } from './entities/resources.entity';
import { FileInterface } from './interfaces/file';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(ResourcesEntity)
    private readonly uploadRepo: Repository<ResourcesEntity>,
    private readonly awsService: AwsService,
  ) {}

  async handleUploadFile(file: FileInterface) {
    const ext: string = file.fileType.ext;
    const path = await this.awsService.uploadFileToS3(file);

    await this.uploadRepo.save({
      file_name: file.originalName,
      type: ResourceTypeEnum.Image,
      encoding: file.encoding,
      path: path,
      size: file.size,
      is_keep: 1,
      ext: ext,
    });

    return path;
  }
}
