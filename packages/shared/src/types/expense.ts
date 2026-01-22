// Expense Types

import { BaseEntity } from './common';
import { Category, PaymentMethod } from '../constants';

export interface Expense extends BaseEntity {
  tripId: string;
  userId: string;
  destinationId?: string;
  walletId?: string;

  // 금액 정보
  amount: number;
  currency: string;
  exchangeRate: number;
  amountKRW: number;

  // 분류
  category: Category;
  paymentMethod: PaymentMethod;

  // 기타
  description?: string;
  memo?: string;
  expenseDate: string;    // YYYY-MM-DD
  expenseTime?: string;   // HH:mm

  // OCR
  receiptImageUrl?: string;
  ocrProcessed: boolean;
  ocrConfidence?: number;
}

export interface ExpenseStats {
  totalKRW: number;
  totalLocal: Record<string, number>;
  byCategory: Record<Category, number>;
  byDate: Record<string, number>;
  byDestination: Record<string, number>;
  byCurrency: Record<string, { amount: number; amountKRW: number }>;
  avgPerDay: number;
  maxDay: { date: string; amount: number } | null;
  maxCategory: { category: Category; amount: number } | null;
}

// DTOs
export interface CreateExpenseDto {
  tripId: string;
  destinationId?: string;
  walletId?: string;
  amount: number;
  currency: string;
  category: Category;
  paymentMethod: PaymentMethod;
  description?: string;
  memo?: string;
  expenseDate: string;
  expenseTime?: string;
}

export interface UpdateExpenseDto {
  amount?: number;
  category?: Category;
  paymentMethod?: PaymentMethod;
  description?: string;
  memo?: string;
  expenseDate?: string;
  expenseTime?: string;
}
