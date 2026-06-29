import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseFilePipe } from '../../common/pipes/parse-file.pipe';
import { CurrentUserData } from '../../common/types/common.types';
import { ResumeService } from './resume.service';
import { UploadResumeDto } from './dto/upload-resume.dto';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser() user: CurrentUserData,
    @UploadedFile(new ParseFilePipe()) file: Express.Multer.File,
    @Body() dto: UploadResumeDto,
  ) {
    return this.resumeService.upload(user.id, file, dto);
  }

  @Post(':id/analyze')
  async analyze(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.resumeService.analyze(user.id, id);
  }

  @Get()
  async findAll(@CurrentUser() user: CurrentUserData) {
    return this.resumeService.findAll(user.id);
  }

  @Get(':id')
  async findById(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.resumeService.findById(user.id, id);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.resumeService.remove(user.id, id);
    return { success: true };
  }
}
