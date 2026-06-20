import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QuestionSet } from './question-set.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'question_set_id' })
  questionSetId: number;

  @ManyToOne(() => QuestionSet, (qs) => qs.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_set_id' })
  questionSet: QuestionSet;

  @Column({ name: 'parent_question_id', nullable: true })
  parentQuestionId: number | null;

  @ManyToOne(() => Question, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'parent_question_id' })
  parentQuestion: Question | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'varchar', length: 20 })
  difficulty: string;

  @Column({ name: 'order', type: 'smallint' })
  order: number;

  @Column({
    name: 'question_type',
    type: 'varchar',
    length: 20,
    default: 'normal',
  })
  questionType: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
