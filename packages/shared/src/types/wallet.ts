// Wallet Types

import { BaseEntity } from './common';
import { WalletTransactionType, SupportedCurrency } from '../constants';

export interface Wallet extends BaseEntity {
  tripId: string;
  userId: string;
  currency: SupportedCurrency;
  name?: string;
}

export interface WalletTransaction extends BaseEntity {
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  exchangeRate?: number;
  amountKRW?: number;
  memo?: string;
}

export interface WalletWithBalance extends Wallet {
  balance: number;
  totalDeposit: number;
  totalWithdraw: number;
}

// DTOs
export interface CreateWalletDto {
  tripId: string;
  currency: SupportedCurrency;
  name?: string;
  initialDeposit?: number;
  exchangeRate?: number;
}

export interface CreateTransactionDto {
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  exchangeRate?: number;
  memo?: string;
}
