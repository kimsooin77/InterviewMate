export class EvaluationScoresDto {
  accuracy: number;
  depth: number;
  structure: number;
  communication: number;
}

export class EvaluationItemResponseDto {
  questionId: number;
  question: string;
  answer: string;
  scores: EvaluationScoresDto;
  totalScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}
