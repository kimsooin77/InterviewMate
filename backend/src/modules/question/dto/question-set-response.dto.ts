import { QuestionResponseDto } from './question-response.dto';

export class QuestionSetResponseDto {
  id: number;
  resumeId: number;
  difficulty: string;
  questionCount: number;
  jobPosting: string | null;
  questions: QuestionResponseDto[];
  createdAt: Date;
}
