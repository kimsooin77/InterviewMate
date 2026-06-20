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
import { User } from '../../auth/entities/user.entity';
import { Resume } from '../../resume/entities/resume.entity';
import { QuestionSet } from '../../question/entities/question-set.entity';
import { InterviewAnswer } from './interview-answer.entity';

@Entity('interview_sessions')
export class InterviewSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'resume_id' })
  resumeId: number;

  @ManyToOne(() => Resume, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resume_id' })
  resume: Resume;

  @Column({ name: 'question_set_id' })
  questionSetId: number;

  @ManyToOne(() => QuestionSet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_set_id' })
  questionSet: QuestionSet;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'in_progress',
  })
  status: string;

  @Column({ name: 'total_questions', type: 'smallint' })
  totalQuestions: number;

  @Column({ type: 'varchar', length: 20 })
  difficulty: string;

  @CreateDateColumn({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => InterviewAnswer, (answer) => answer.session)
  answers: InterviewAnswer[];
}
