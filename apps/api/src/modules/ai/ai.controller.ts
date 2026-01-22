import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIService } from './ai.service';
import { AnalyzeReceiptDto } from './dto/analyze-receipt.dto';
import { ChatDto } from './dto/chat.dto';
import { AuthenticatedRequest } from '../../common/interfaces/request.interface';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('receipt/analyze')
  @ApiOperation({ summary: 'Analyze receipt image with AI' })
  async analyzeReceipt(@Req() req: AuthenticatedRequest, @Body() analyzeReceiptDto: AnalyzeReceiptDto) {
    return this.aiService.analyzeReceipt(req.user.id, analyzeReceiptDto);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI assistant' })
  async chat(@Req() req: AuthenticatedRequest, @Body() chatDto: ChatDto) {
    return this.aiService.chat(req.user.id, chatDto);
  }

  @Get('chat/history')
  @ApiOperation({ summary: 'Get chat history' })
  async getChatHistory(
    @Req() req: AuthenticatedRequest,
    @Query('tripId') tripId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.aiService.getChatHistory(req.user.id, tripId, limit || 20);
  }
}
