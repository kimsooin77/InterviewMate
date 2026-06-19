import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentUserData } from '../../common/types/common.types';
import { ReportService } from './report.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get(':sessionId')
  async findBySessionId(
    @CurrentUser() user: CurrentUserData,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.reportService.findBySessionId(user.id, sessionId);
  }
}
