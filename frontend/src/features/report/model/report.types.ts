export interface CategoryScore {
  category: string;
  score: number;
  questionCount: number;
}

export interface QuestionResult {
  questionId: number;
  content: string;
  category: string;
  score: number;
  grade: string;
}

export interface ReportMetadata {
  totalQuestions: number;
  duration: number;
  difficulty: string;
  completedAt: string;
}

export interface Report {
  id: number;
  sessionId: number;
  overallScore: number;
  grade: string;
  summary: string;
  categoryScores: CategoryScore[];
  strengths: string[];
  improvements: string[];
  questionResults: QuestionResult[];
  metadata: ReportMetadata;
  createdAt: string;
}
