// Travel Helper v2.0 - Type Definitions

import { Category, PaymentMethod, WalletTransactionType } from './utils/constants';

// 여행
export interface Trip {
  id: string;
  name: string;
  startDate: string;        // YYYY-MM-DD
  endDate: string;
  budget?: number;          // 총 예산 (KRW)
  coverImage?: string;      // 커버 이미지 (선택)
  createdAt: string;
}

// 방문지 (여행 > 여러 국가/도시)
export interface Destination {
  id: string;
  tripId: string;
  country: string;          // "프랑스"
  city?: string;            // "파리" (선택)
  currency: string;         // "EUR"
  startDate?: string;       // 해당 지역 체류 시작일
  endDate?: string;         // 해당 지역 체류 종료일
  orderIndex: number;       // 방문 순서
  createdAt: string;
}

// 환전 지갑
export interface Wallet {
  id: string;
  tripId: string;
  currency: string;         // "EUR", "JPY"
  name?: string;            // "유로 현금", "엔화 지갑"
  createdAt: string;
}

// 지갑 거래 내역
export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTransactionType;  // 'deposit' | 'withdraw' | 'adjust'
  amount: number;               // 양수: 입금, 음수: 출금
  exchangeRate?: number;        // 환전 시 적용 환율 (1 외화 = X 원)
  memo?: string;
  createdAt: string;
}

// 지출
export interface Expense {
  id: string;
  tripId: string;
  destinationId?: string;       // 어느 방문지에서 지출했는지

  // 금액 정보
  amount: number;               // 현지 통화 금액
  currency: string;             // 현지 통화 코드

  // 결제 방식
  paymentMethod: PaymentMethod; // 'wallet' | 'card' | 'cash'
  walletId?: string;            // 지갑 결제 시

  // 원화 환산 (참고용)
  exchangeRate: number;         // 지출 시점 환율
  amountKRW: number;            // 환산 원화

  // 기타
  category: Category;
  memo?: string;
  date: string;                 // YYYY-MM-DD
  time?: string;                // HH:mm (선택)

  // OCR 관련 (준비중)
  receiptImage?: string;        // 영수증 이미지 경로
  ocrProcessed?: boolean;       // OCR 처리 여부

  createdAt: string;
}

// 환율 캐시
export interface ExchangeRateCache {
  rates: Record<string, number>;
  lastUpdated: string;
}

// 통계 (확장)
export interface ExpenseStats {
  totalKRW: number;
  totalLocal: Record<string, number>;  // 통화별 합계
  byCategory: Record<Category, number>;
  byDate: Record<string, number>;
  byDestination: Record<string, number>;
  byCurrency: Record<string, { amount: number; amountKRW: number }>;
}

// 지갑 잔액 정보 (계산용)
export interface WalletBalance {
  wallet: Wallet;
  balance: number;        // 현재 잔액
  totalDeposit: number;   // 총 입금액
  totalWithdraw: number;  // 총 출금액
  transactions: WalletTransaction[];
}

// 여행 + 방문지 + 지갑 통합 정보
export interface TripWithDetails extends Trip {
  destinations: Destination[];
  wallets: WalletBalance[];
  totalExpenseKRW: number;
}

// 현재 위치 정보 (날짜 기반 자동 감지)
export interface CurrentLocation {
  destination: Destination | null;
  dayIndex: number;  // 여행 몇일차
}
