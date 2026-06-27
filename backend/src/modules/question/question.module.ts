import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { QuestionSet } from './entities/question-set.entity';
import { Question } from './entities/question.entity';
import { ResumeModule } from '../resume/resume.module';
import { OpenAIInfrastructureModule } from '../../infrastructure/openai/openai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionSet, Question]),
    ResumeModule,
    OpenAIInfrastructureModule,
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
