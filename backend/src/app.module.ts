import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { ResumeModule } from './modules/resume/resume.module';
import { QuestionModule } from './modules/question/question.module';
import { InterviewModule } from './modules/interview/interview.module';
import { EvaluationModule } from './modules/evaluation/evaluation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync(databaseConfig),
    AuthModule,
    ResumeModule,
    QuestionModule,
    InterviewModule,
    EvaluationModule,
  ],
})
export class AppModule {}
