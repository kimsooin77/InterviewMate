import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('resumes')
export class Resume extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'file_path', type: 'varchar', length: 500 })
  filePath: string;

  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @Column({ name: 'raw_text', type: 'text', nullable: true })
  rawText: string | null;

  @Column({
    name: 'analysis_status',
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  analysisStatus: string;

  @Column({ type: 'jsonb', default: '[]' })
  skills: string[];

  @Column({ type: 'jsonb', default: '[]' })
  careers: Record<string, unknown>[];

  @Column({ type: 'jsonb', default: '[]' })
  projects: Record<string, unknown>[];

  @Column({ name: 'analysis_completed_at', type: 'timestamptz', nullable: true })
  analysisCompletedAt: Date | null;
}
