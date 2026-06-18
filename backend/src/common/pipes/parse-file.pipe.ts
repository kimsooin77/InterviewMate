import {
  PipeTransform,
  Injectable,
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';

interface ParseFileOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
}

@Injectable()
export class ParseFilePipe implements PipeTransform {
  private readonly maxSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(options: ParseFileOptions = {}) {
    this.maxSize = options.maxSize || 10 * 1024 * 1024;
    this.allowedMimeTypes = options.allowedMimeTypes || ['application/pdf'];
  }

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('파일이 첨부되지 않았습니다.');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException(
        `지원하지 않는 파일 형식입니다. 허용: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxSize) {
      const maxMB = Math.floor(this.maxSize / (1024 * 1024));
      throw new BadRequestException(
        `파일 크기가 ${maxMB}MB를 초과합니다.`,
      );
    }

    return file;
  }
}
