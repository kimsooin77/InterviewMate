import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { InterviewSession } from './entities/interview-session.entity';
import { InterviewAnswer } from './entities/interview-answer.entity';
import { Question } from '../question/entities/question.entity';
import { Evaluation } from '../evaluation/entities/evaluation.entity';
import { QuestionModule } from '../question/question.module';
import { OpenAIInfrastructureModule } from '../../infrastructure/openai/openai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InterviewSession, InterviewAnswer, Question, Evaluation]),
    QuestionModule,
    OpenAIInfrastructureModule,
  ],
  controllers: [InterviewController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewModule {}
