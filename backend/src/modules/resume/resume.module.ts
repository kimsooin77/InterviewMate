import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { Resume } from './entities/resume.entity';
import { OpenAIInfrastructureModule } from '../../infrastructure/openai/openai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Resume]), OpenAIInfrastructureModule],
  controllers: [ResumeController],
  providers: [ResumeService],
  exports: [ResumeService],
})
export class ResumeModule {}
