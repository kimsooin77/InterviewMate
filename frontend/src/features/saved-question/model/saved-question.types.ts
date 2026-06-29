export type SavedQuestionCategory =
  | 'common'
  | 'project'
  | 'technical'
  | 'behavior'
  | 'company';

export type SavedQuestionReviewStatus = 'new' | 'reviewing' | 'confident';

export interface SavedInterviewQuestion {
  id: string;
  question: string;
  answer: string;
  followUpQuestion: string;
  followUpAnswer: string;
  category: SavedQuestionCategory;
  tags: string[];
  source: 'default' | 'manual' | 'generated' | 'evaluation';
  reviewStatus: SavedQuestionReviewStatus;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveQuestionInput {
  question: string;
  answer?: string;
  followUpQuestion?: string;
  followUpAnswer?: string;
  category?: SavedQuestionCategory;
  tags?: string[];
  source?: SavedInterviewQuestion['source'];
}
