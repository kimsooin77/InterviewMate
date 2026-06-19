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
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

@Controller('evaluations')
@UseGuards(JwtAuthGuard)
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateEvaluationDto,
  ) {
    return this.evaluationService.create(user.id, dto);
  }

  @Get(':sessionId')
  async findBySessionId(
    @CurrentUser() user: CurrentUserData,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.evaluationService.findBySessionId(user.id, sessionId);
  }
}
