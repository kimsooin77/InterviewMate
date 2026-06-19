import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationItem } from './entities/evaluation-item.entity';
import { InterviewSession } from '../interview/entities/interview-session.entity';
import { InterviewAnswer } from '../interview/entities/interview-answer.entity';
import { ReportModule } from '../report/report.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Evaluation,
      EvaluationItem,
      InterviewSession,
      InterviewAnswer,
    ]),
    ReportModule,
  ],
  controllers: [EvaluationController],
  providers: [EvaluationService],
  exports: [EvaluationService],
})
export class EvaluationModule {}
