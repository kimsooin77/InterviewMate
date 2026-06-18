import { IsInt, IsNotEmpty, IsOptional, IsIn, Min, Max } from 'class-validator';

export class GenerateQuestionsDto {
  @IsInt()
  @IsNotEmpty({ message: '이력서 ID는 필수 항목입니다.' })
  resumeId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  count?: number = 10;

  @IsOptional()
  @IsIn(['easy', 'medium', 'hard'], {
    message: '난이도는 easy, medium, hard 중 하나여야 합니다.',
  })
  difficulty?: string = 'medium';
}
