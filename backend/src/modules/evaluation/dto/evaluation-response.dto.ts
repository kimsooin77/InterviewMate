import { EvaluationItemResponseDto } from './evaluation-item-response.dto';

export class EvaluationResponseDto {
  id: number;
  sessionId: number;
  overallScore: number;
  evaluations: EvaluationItemResponseDto[];
  createdAt: Date;
}
