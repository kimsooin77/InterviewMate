export class QuestionResponseDto {
  id: number;
  content: string;
  category: string;
  difficulty: string;
  order: number;
  isFollowUp: boolean;
  parentQuestionId: number | null;
}
