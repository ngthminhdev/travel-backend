import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { AwsService } from '../aws/aws.service';
import { ResourcesEntity } from './entities/resources.entity';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResourcesEntity]),
    NestjsFormDataModule,
    AwsModule,
  ],
  controllers: [UploadController],
  providers: [UploadService, AwsService],
})
export class UploadModule {}
