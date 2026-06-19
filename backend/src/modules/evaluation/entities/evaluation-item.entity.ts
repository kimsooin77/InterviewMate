import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Evaluation } from './evaluation.entity';
import { Question } from '../../question/entities/question.entity';
import { InterviewAnswer } from '../../interview/entities/interview-answer.entity';

@Entity('evaluation_items')
@Unique(['evaluationId', 'questionId'])
export class EvaluationItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'evaluation_id' })
  evaluationId: number;

  @ManyToOne(() => Evaluation, (evaluation) => evaluation.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;

  @Column({ name: 'question_id' })
  questionId: number;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ name: 'answer_id' })
  answerId: number;

  @ManyToOne(() => InterviewAnswer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'answer_id' })
  answer: InterviewAnswer;

  @Column({ type: 'jsonb' })
  scores: {
    accuracy: number;
    depth: number;
    structure: number;
    communication: number;
  };

  @Column({ name: 'total_score', type: 'smallint' })
  totalScore: number;

  @Column({ type: 'text' })
  feedback: string;

  @Column({ type: 'jsonb', default: '[]' })
  strengths: string[];

  @Column({ type: 'jsonb', default: '[]' })
  improvements: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
