export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export type SortOrder = 'ASC' | 'DESC';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type AnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed';

export type SessionStatus = 'in_progress' | 'completed';
