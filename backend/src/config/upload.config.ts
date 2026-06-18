import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export interface UploadConfig {
  resumePath: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
}

export const getUploadConfig = (configService: ConfigService): UploadConfig => ({
  resumePath: configService.get<string>(
    'UPLOAD_RESUME_PATH',
    join(process.cwd(), 'uploads', 'resumes'),
  ),
  maxFileSize: configService.get<number>('UPLOAD_MAX_FILE_SIZE', 10 * 1024 * 1024),
  allowedMimeTypes: ['application/pdf'],
});
