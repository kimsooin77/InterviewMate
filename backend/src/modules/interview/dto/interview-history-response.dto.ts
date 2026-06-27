export class InterviewHistoryItemDto {
  id: number;
  questionSetId: number;
  resumeId: number;
  resumeTitle: string;
  status: string;
  difficulty: string;
  totalQuestions: number;
  answeredCount: number;
  jobPostingApplied: boolean;
  hasEvaluation: boolean;
  overallScore: number | null;
  startedAt: Date;
  completedAt: Date | null;
}
