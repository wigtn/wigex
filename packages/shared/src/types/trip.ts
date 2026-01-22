// Trip Types

import { BaseEntity } from './common';
import { TripStatus, SupportedCurrency } from '../constants';

export interface Trip extends BaseEntity {
  userId: string;
  name: string;
  startDate: string;       // YYYY-MM-DD
  endDate?: string;
  budget?: number;         // 총 예산 (KRW)
  budgetCurrency: string;  // 예산 통화 (기본: KRW)
  status: TripStatus;
  coverImage?: string;
}

export interface Destination extends BaseEntity {
  tripId: string;
  country: string;         // "프랑스"
  city?: string;           // "파리" (선택)
  currency: SupportedCurrency;
  startDate?: string;
  endDate?: string;
  orderIndex: number;
}

export interface TripWithDetails extends Trip {
  destinations: Destination[];
  totalExpenseKRW: number;
  expenseCount: number;
}

// DTOs
export interface CreateTripDto {
  name: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  budgetCurrency?: string;
  destinations: CreateDestinationDto[];
}

export interface UpdateTripDto {
  name?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status?: TripStatus;
}

export interface CreateDestinationDto {
  country: string;
  city?: string;
  currency: SupportedCurrency;
  startDate?: string;
  endDate?: string;
  orderIndex?: number;
}
