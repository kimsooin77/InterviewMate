import { CurrentQuestionDto } from './session-response.dto';

export class ProgressDto {
  current: number;
  total: number;
}

export class AnswerResponseDto {
  id: number;
  sessionId: number;
  questionId: number;
  content: string;
  nextQuestion: CurrentQuestionDto | null;
  progress: ProgressDto;
  sessionStatus?: string;
  submittedAt: Date;
}
