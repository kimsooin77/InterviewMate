import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { InterviewSession } from '../../interview/entities/interview-session.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id', unique: true })
  sessionId: number;

  @OneToOne(() => InterviewSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: InterviewSession;

  @Column({ name: 'overall_score', type: 'smallint' })
  overallScore: number;

  @Column({ type: 'varchar', length: 5 })
  grade: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'jsonb', default: '[]' })
  strengths: string[];

  @Column({ type: 'jsonb', default: '[]' })
  improvements: string[];

  @Column({ name: 'category_scores', type: 'jsonb', default: '[]' })
  categoryScores: { category: string; score: number; questionCount: number }[];

  @Column({ type: 'jsonb', default: '{}' })
  metadata: {
    totalQuestions: number;
    duration: number;
    difficulty: string;
    completedAt: string;
  };

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
