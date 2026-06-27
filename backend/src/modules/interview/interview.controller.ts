import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUserData } from '../../common/types/common.types';
import { InterviewService } from './interview.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Get('history')
  async findHistory(@CurrentUser() user: CurrentUserData) {
    return this.interviewService.findHistory(user.id);
  }

  @Post()
  async createSession(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateSessionDto,
  ) {
    return this.interviewService.createSession(user.id, dto);
  }

  @Post(':id/answers')
  async submitAnswer(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.interviewService.submitAnswer(user.id, id, dto);
  }
}
