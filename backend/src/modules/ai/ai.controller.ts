import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AiService } from './ai.service.js';
import { ChatPromptDto, PredictEtaDto } from './dto/chat-prompt.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() dto: ChatPromptDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.aiService.chatWithCopilot(dto, userId);
  }

  @Get('recommendations')
  async getRecommendations() {
    return this.aiService.getOperationalRecommendations();
  }

  @Post('predict-eta')
  async predictEta(@Body() dto: PredictEtaDto) {
    return this.aiService.predictEta(dto);
  }
}
