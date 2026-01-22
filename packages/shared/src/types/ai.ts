// AI Types

import { Category } from '../constants';

// Receipt OCR
export interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
}

export interface ReceiptAnalysis {
  store: string;
  date: string;
  time?: string;
  items: ReceiptItem[];
  subtotal?: number;
  tax?: number;
  total: number;
  currency: string;
  category: Category;
  confidence: number;
  rawText?: string;
}

export interface AnalyzeReceiptDto {
  image: string;         // Base64 encoded image
  mimeType: string;      // 'image/jpeg', 'image/png'
  tripId: string;
  destinationId?: string;
}

export interface AnalyzeReceiptResponse {
  success: boolean;
  analysis: ReceiptAnalysis | null;
  expenseId?: string;    // 자동 생성된 지출 ID
  error?: string;
}

// Chatbot
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatContext {
  tripId?: string;
  userId: string;
  language?: 'ko' | 'en';
}

export interface ChatRequest {
  message: string;
  tripId?: string;
  conversationId?: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  suggestions?: string[];
}

// AI Provider Config
export type AIProviderType = 'self-hosted' | 'openai' | 'groq' | 'anthropic';

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}
