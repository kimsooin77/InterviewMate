import { CurrentQuestionDto } from './session-response.dto';

export class ProgressDto {
  current: number;
  total: number;
}

export class AnswerFeedbackDto {
  isCorrect: boolean;
  explanation: string;
}

export class AnswerResponseDto {
  id: number;
  sessionId: number;
  questionId: number;
  content: string;
  feedback: AnswerFeedbackDto;
  nextQuestion: CurrentQuestionDto | null;
  progress: ProgressDto;
  sessionStatus?: string;
  submittedAt: Date;
}
