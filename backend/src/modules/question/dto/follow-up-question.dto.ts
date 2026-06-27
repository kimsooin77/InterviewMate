import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class FollowUpQuestionDto {
  @IsInt()
  @IsNotEmpty({ message: '원본 질문 ID는 필수 항목입니다.' })
  questionId: number;

  @IsString()
  @IsNotEmpty({ message: '답변 내용은 필수 항목입니다.' })
  answer: string;
}
