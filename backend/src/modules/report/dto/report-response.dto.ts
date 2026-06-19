export class CategoryScoreDto {
  category: string;
  score: number;
  questionCount: number;
}

export class QuestionResultDto {
  questionId: number;
  content: string;
  category: string;
  score: number;
  grade: string;
}

export class ReportMetadataDto {
  totalQuestions: number;
  duration: number;
  difficulty: string;
  completedAt: string;
}

export class ReportResponseDto {
  id: number;
  sessionId: number;
  overallScore: number;
  grade: string;
  summary: string;
  categoryScores: CategoryScoreDto[];
  strengths: string[];
  improvements: string[];
  questionResults: QuestionResultDto[];
  metadata: ReportMetadataDto;
  createdAt: Date;
}
