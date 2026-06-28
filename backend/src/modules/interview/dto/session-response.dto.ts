export class CurrentQuestionDto {
  id: number;
  content: string;
  category: string;
  difficulty: string;
  order: number;
  isFollowUp: boolean;
  parentQuestionId: number | null;
}

export class SessionResponseDto {
  id: number;
  questionSetId: number;
  status: string;
  currentOrder: number;
  totalQuestions: number;
  currentQuestion: CurrentQuestionDto | null;
  answeredCount: number;
  elapsedSeconds: number;
  startedAt: Date;
  completedAt: Date | null;
}
