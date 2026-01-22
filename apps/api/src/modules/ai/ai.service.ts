import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';
import { ExpenseService } from '../expense/expense.service';
import { AnalyzeReceiptDto } from './dto/analyze-receipt.dto';
import { ChatDto } from './dto/chat.dto';

export interface ReceiptAnalysis {
  store: string;
  date: string;
  time?: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
  currency: string;
  category: string;
  confidence: number;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly expenseService: ExpenseService,
  ) {}

  async analyzeReceipt(userId: string, dto: AnalyzeReceiptDto): Promise<{
    success: boolean;
    analysis: ReceiptAnalysis | null;
    expenseId?: string;
    error?: string;
  }> {
    const provider = this.configService.get<string>('ai.provider');

    try {
      let analysis: ReceiptAnalysis;

      switch (provider) {
        case 'self-hosted':
          analysis = await this.analyzeWithSelfHosted(dto.image, dto.mimeType);
          break;
        case 'openai':
          analysis = await this.analyzeWithOpenAI(dto.image, dto.mimeType);
          break;
        case 'groq':
          analysis = await this.analyzeWithGroq(dto.image, dto.mimeType);
          break;
        default:
          throw new Error(`Unknown AI provider: ${provider}`);
      }

      // Auto-create expense if tripId provided
      let expenseId: string | undefined;
      if (dto.tripId && analysis) {
        const expense = await this.expenseService.create(userId, dto.tripId, {
          amount: analysis.total,
          currency: analysis.currency,
          exchangeRate: 1, // TODO: Get actual exchange rate
          amountKRW: analysis.total, // TODO: Convert to KRW
          category: analysis.category,
          paymentMethod: 'card',
          description: analysis.store,
          expenseDate: analysis.date,
          expenseTime: analysis.time,
          destinationId: dto.destinationId,
        });
        expenseId = expense.id;
      }

      return {
        success: true,
        analysis,
        expenseId,
      };
    } catch (error) {
      this.logger.error('Receipt analysis failed:', error);
      return {
        success: false,
        analysis: null,
        error: error.message,
      };
    }
  }

  async chat(userId: string, dto: ChatDto): Promise<{
    message: string;
    conversationId: string;
    suggestions?: string[];
  }> {
    const provider = this.configService.get<string>('ai.provider');

    // Get user context (expenses, trips) if tripId provided
    let context = '';
    if (dto.tripId) {
      const stats = await this.expenseService.getStats(userId, dto.tripId);
      context = `
사용자의 현재 여행 지출 통계:
- 총 지출: ${stats.totalKRW.toLocaleString()}원
- 지출 건수: ${stats.expenseCount}건
- 일평균: ${Math.round(stats.avgPerDay).toLocaleString()}원
- 카테고리별: ${JSON.stringify(stats.byCategory)}
`;
    }

    // Save user message
    await this.prisma.chatMessage.create({
      data: {
        userId,
        tripId: dto.tripId,
        role: 'user',
        content: dto.message,
      },
    });

    // Get recent chat history
    const history = await this.prisma.chatMessage.findMany({
      where: { userId, tripId: dto.tripId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    let response: string;
    try {
      switch (provider) {
        case 'self-hosted':
          response = await this.chatWithSelfHosted(dto.message, context, history);
          break;
        case 'openai':
          response = await this.chatWithOpenAI(dto.message, context, history);
          break;
        case 'groq':
          response = await this.chatWithGroq(dto.message, context, history);
          break;
        default:
          throw new Error(`Unknown AI provider: ${provider}`);
      }
    } catch (error) {
      this.logger.error('Chat failed:', error);
      response = '죄송합니다, 일시적인 오류가 발생했습니다. 다시 시도해 주세요.';
    }

    // Save assistant message
    await this.prisma.chatMessage.create({
      data: {
        userId,
        tripId: dto.tripId,
        role: 'assistant',
        content: response,
      },
    });

    // Generate suggestions
    const suggestions = this.generateSuggestions(dto.message);

    return {
      message: response,
      conversationId: dto.tripId || userId,
      suggestions,
    };
  }

  async getChatHistory(userId: string, tripId?: string, limit: number = 20) {
    return this.prisma.chatMessage.findMany({
      where: {
        userId,
        ...(tripId && { tripId }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Provider implementations

  private async analyzeWithSelfHosted(image: string, mimeType: string): Promise<ReceiptAnalysis> {
    const serviceUrl = this.configService.get<string>('ai.serviceUrl');
    const response = await firstValueFrom(
      this.httpService.post(`${serviceUrl}/receipt/analyze`, {
        image,
        mimeType,
      }),
    );
    return response.data;
  }

  private async analyzeWithOpenAI(image: string, mimeType: string): Promise<ReceiptAnalysis> {
    const apiKey = this.configService.get<string>('ai.openaiApiKey');
    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a receipt analyzer. Extract information from the receipt image and return JSON:
{
  "store": "store name",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "items": [{"name": "item", "price": 100, "quantity": 1}],
  "total": 100,
  "currency": "USD",
  "category": "food|transport|shopping|lodging|activity|etc",
  "confidence": 0.95
}`,
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyze this receipt:' },
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${image}` } },
              ],
            },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return JSON.parse(response.data.choices[0].message.content);
  }

  private async analyzeWithGroq(image: string, mimeType: string): Promise<ReceiptAnalysis> {
    const apiKey = this.configService.get<string>('ai.groqApiKey');
    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.2-90b-vision-preview',
          messages: [
            {
              role: 'system',
              content: `You are a receipt analyzer. Extract information and return JSON:
{"store":"name","date":"YYYY-MM-DD","time":"HH:mm","items":[{"name":"item","price":100,"quantity":1}],"total":100,"currency":"USD","category":"food|transport|shopping|lodging|activity|etc","confidence":0.95}`,
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyze this receipt:' },
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${image}` } },
              ],
            },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return JSON.parse(response.data.choices[0].message.content);
  }

  private async chatWithSelfHosted(message: string, context: string, history: any[]): Promise<string> {
    const serviceUrl = this.configService.get<string>('ai.serviceUrl');
    const response = await firstValueFrom(
      this.httpService.post(`${serviceUrl}/chat`, {
        message,
        context,
        history: history.reverse().map((h) => ({ role: h.role, content: h.content })),
      }),
    );
    return response.data.message;
  }

  private async chatWithOpenAI(message: string, context: string, history: any[]): Promise<string> {
    const apiKey = this.configService.get<string>('ai.openaiApiKey');
    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `당신은 여행 지출 관리 앱의 AI 어시스턴트입니다. 사용자의 지출 관련 질문에 친절하게 답변해주세요.
${context}`,
            },
            ...history.reverse().map((h) => ({ role: h.role, content: h.content })),
            { role: 'user', content: message },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return response.data.choices[0].message.content;
  }

  private async chatWithGroq(message: string, context: string, history: any[]): Promise<string> {
    const apiKey = this.configService.get<string>('ai.groqApiKey');
    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `당신은 여행 지출 관리 앱의 AI 어시스턴트입니다. 사용자의 지출 관련 질문에 친절하게 답변해주세요.
${context}`,
            },
            ...history.reverse().map((h) => ({ role: h.role, content: h.content })),
            { role: 'user', content: message },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return response.data.choices[0].message.content;
  }

  private generateSuggestions(lastMessage: string): string[] {
    // Simple rule-based suggestions
    const suggestions: string[] = [];

    if (lastMessage.includes('오늘') || lastMessage.includes('지출')) {
      suggestions.push('이번 주 총 지출은?', '예산 얼마 남았어?');
    }

    if (lastMessage.includes('예산')) {
      suggestions.push('남은 예산으로 며칠 버틸 수 있어?', '가장 많이 쓴 카테고리는?');
    }

    if (lastMessage.includes('카테고리') || lastMessage.includes('많이')) {
      suggestions.push('일별 지출 추이 알려줘', '오늘 지출 내역은?');
    }

    return suggestions.slice(0, 3);
  }
}
