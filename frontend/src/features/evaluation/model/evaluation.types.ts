export interface EvaluationScores {
  accuracy: number;
  depth: number;
  structure: number;
  communication: number;
}

export interface EvaluationItem {
  questionId: number;
  question: string;
  answer: string;
  scores: EvaluationScores;
  totalScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  idealAnswer: string;
}

export interface Evaluation {
  id: number;
  sessionId: number;
  overallScore: number;
  evaluations: EvaluationItem[];
  createdAt: string;
}

export interface CreateEvaluationRequest {
  sessionId: number;
}
