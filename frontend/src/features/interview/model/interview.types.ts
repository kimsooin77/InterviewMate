export interface CurrentQuestion {
  id: number;
  content: string;
  category: string;
  difficulty: string;
  order: number;
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

export interface AnswerResponse {
  id: number;
  sessionId: number;
  questionId: number;
  content: string;
  nextQuestion: CurrentQuestion | null;
  progress: Progress;
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
