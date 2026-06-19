import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateEvaluationDto {
  @IsInt()
  @IsNotEmpty({ message: '면접 세션 ID는 필수 항목입니다.' })
  sessionId: number;
}
