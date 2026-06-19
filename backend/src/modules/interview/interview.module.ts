import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { InterviewSession } from './entities/interview-session.entity';
import { InterviewAnswer } from './entities/interview-answer.entity';
import { Question } from '../question/entities/question.entity';
import { QuestionModule } from '../question/question.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InterviewSession, InterviewAnswer, Question]),
    QuestionModule,
  ],
  controllers: [InterviewController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewModule {}
