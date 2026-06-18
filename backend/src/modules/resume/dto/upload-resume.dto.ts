import { IsOptional, IsString } from 'class-validator';

export class UploadResumeDto {
  @IsOptional()
  @IsString()
  title?: string;
}
