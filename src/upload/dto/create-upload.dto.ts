import { IsFile, MaxFileSize } from "nestjs-form-data";

export class CreateUploadDto {
  @IsFile({message: 'File không hợp lệ'})
  // @MaxFileSize(1e6, {message: 'File quá lớn'})
  file: any
}
