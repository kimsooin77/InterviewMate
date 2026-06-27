export interface CurrentQuestion {
  id: number;
  content: string;
  category: string;
  difficulty: string;
  order: number;
  isFollowUp: boolean;
  parentQuestionId: number | null;
}

export interface InterviewSession {
  id: number;
  questionSetId: number;
  status: string;
  currentOrder: number;
  totalQuestions: number;
  currentQuestion: CurrentQuestion;
  startedAt: string;
}

export interface Progress {
  current: number;
  total: number;
}

export interface AnswerFeedback {
  isCorrect: boolean;
  explanation: string;
}

export interface AnswerResponse {
  id: number;
  sessionId: number;
  questionId: number;
  content: string;
  feedback: AnswerFeedback;
  nextQuestion: CurrentQuestion | null;
  progress: Progress;
  hasFollowUp?: boolean;
  sessionStatus?: string;
  submittedAt: string;
}

export interface CreateSessionRequest {
  questionSetId: number;
}

export interface SubmitAnswerRequest {
  questionId: number;
  content: string;
}

export interface InterviewHistoryItem {
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
  startedAt: string;
  completedAt: string | null;
}
