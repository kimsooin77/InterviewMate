import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUserData } from '../../common/types/common.types';
import { QuestionService } from './question.service';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { FollowUpQuestionDto } from './dto/follow-up-question.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('questions/generate')
  async generate(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: GenerateQuestionsDto,
  ) {
    return this.questionService.generate(user.id, dto);
  }

  @Post('questions/follow-up')
  async generateFollowUp(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: FollowUpQuestionDto,
  ) {
    return this.questionService.generateFollowUp(user.id, dto);
  }

  @Get('question-sets/:id')
  async findById(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.questionService.findById(user.id, id);
  }
}
