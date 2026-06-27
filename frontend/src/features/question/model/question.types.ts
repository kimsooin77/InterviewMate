export interface Question {
  id: number;
  content: string;
  category: string;
  difficulty: string;
  order: number;
  isFollowUp: boolean;
  parentQuestionId: number | null;
}

export interface QuestionSet {
  id: number;
  resumeId: number;
  difficulty: string;
  questionCount: number;
  jobPosting: string | null;
  questions: Question[];
  createdAt: string;
}

export interface GenerateQuestionsRequest {
  resumeId: number;
  count?: number;
  difficulty?: string;
  jobPosting?: string;
}
