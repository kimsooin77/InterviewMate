import { QuestionResponseDto } from './question-response.dto';

export class QuestionSetResponseDto {
  id: number;
  resumeId: number;
  difficulty: string;
  questionCount: number;
  questions: QuestionResponseDto[];
  createdAt: Date;
}
