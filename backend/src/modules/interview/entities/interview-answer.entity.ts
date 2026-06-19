import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { InterviewSession } from './interview-session.entity';
import { Question } from '../../question/entities/question.entity';

@Entity('interview_answers')
@Unique(['sessionId', 'questionId'])
export class InterviewAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id' })
  sessionId: number;

  @ManyToOne(() => InterviewSession, (session) => session.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: InterviewSession;

  @Column({ name: 'question_id' })
  questionId: number;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
