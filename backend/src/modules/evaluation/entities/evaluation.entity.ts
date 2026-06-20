import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { InterviewSession } from '../../interview/entities/interview-session.entity';
import { EvaluationItem } from './evaluation-item.entity';

@Entity('evaluations')
export class Evaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id', unique: true })
  sessionId: number;

  @OneToOne(() => InterviewSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: InterviewSession;

  @Column({ name: 'overall_score', type: 'smallint' })
  overallScore: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => EvaluationItem, (item) => item.evaluation)
  items: EvaluationItem[];
}
