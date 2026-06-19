export class CurrentQuestionDto {
  id: number;
  content: string;
  category: string;
  difficulty: string;
  order: number;
}

export class SessionResponseDto {
  id: number;
  questionSetId: number;
  status: string;
  currentOrder: number;
  totalQuestions: number;
  currentQuestion: CurrentQuestionDto;
  startedAt: Date;
}
