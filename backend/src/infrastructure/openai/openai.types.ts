export type AiMode = 'mock' | 'openai';

export interface ResumeCareer {
  [key: string]: unknown;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  duration?: string;
}

export interface ResumeProject {
  [key: string]: unknown;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  skills: string[];
  duration?: string;
  responsibilities?: string[];
}

export interface ResumeAnalysisResult {
  skills: string[];
  careers: ResumeCareer[];
  projects: ResumeProject[];
}

export interface GenerateQuestionsConfig {
  difficulty: string;
  count?: number;
  jobPosting?: string;
}

export interface GeneratedQuestion {
  content: string;
  category: string;
  difficulty: string;
  order: number;
}

export interface GeneratedFollowUpQuestion {
  content: string;
  category: string;
  difficulty: string;
}

export interface AnswerFeedbackResult {
  isCorrect: boolean;
  explanation: string;
}

export interface AnswerEvaluationResult {
  scores: {
    accuracy: number;
    depth: number;
    structure: number;
    communication: number;
  };
  totalScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  idealAnswer: string;
}

export interface ReportGenerationInput {
  difficulty: string;
  totalQuestions: number;
  durationSeconds: number;
  overallScore: number;
  evaluations: {
    questionId: number;
    category: string;
    totalScore: number;
    strengths: string[];
    improvements: string[];
  }[];
}

export interface ReportGenerationResult {
  overallScore: number;
  grade: string;
  summary: string;
  categoryScores: { category: string; score: number; questionCount: number }[];
  strengths: string[];
  improvements: string[];
}
