import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { Report } from './entities/report.entity';
import { InterviewSession } from '../interview/entities/interview-session.entity';
import { Evaluation } from '../evaluation/entities/evaluation.entity';
import { EvaluationItem } from '../evaluation/entities/evaluation-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      InterviewSession,
      Evaluation,
      EvaluationItem,
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
