import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateSessionDto {
  @IsInt()
  @IsNotEmpty({ message: '질문 세트 ID는 필수 항목입니다.' })
  questionSetId: number;
}
