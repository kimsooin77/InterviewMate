import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Resume } from '../../resume/entities/resume.entity';
import { Question } from './question.entity';

@Entity('question_sets')
export class QuestionSet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'resume_id' })
  resumeId: number;

  @ManyToOne(() => Resume, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resume_id' })
  resume: Resume;

  @Column({ type: 'varchar', length: 20 })
  difficulty: string;

  @Column({ name: 'question_count', type: 'smallint' })
  questionCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Question, (question) => question.questionSet)
  questions: Question[];
}
