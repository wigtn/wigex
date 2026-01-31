// Travel Helper v3.0 - Expense Store (Server-only)

import { create } from 'zustand';
import { Expense, ExpenseStats, Destination, DayExpenseGroup } from '../types';
import { Category } from '../utils/constants';
import { expenseApi, CreateExpenseDto, ExpenseResponse } from '../api/expense';
import { parseServerDate, parseServerTime, formatDate } from '../utils/date';

// 현지통화별 합계 타입
export interface LocalAmountItem {
  currency: string;
  amount: number;
}

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // 액션들
  loadExpenses: (tripId: string) => Promise<void>;
  createExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<Expense>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getExpenseById: (id: string) => Expense | null;
  clearError: () => void;

  // 통계 (메모리 기반)
  getStats: (tripId: string) => ExpenseStats;
  getTotalByTrip: (tripId: string) => number;
  getTodayTotal: (tripId: string) => { totalKRW: number; byCurrency: Record<string, number> };
  getTotalLocal: (tripId: string) => LocalAmountItem[];

  // 다중 국가 레이어 (FR-008)
  getExpensesByDateGrouped: (
    tripId: string,
    date: string,
    destinations: Destination[]
  ) => DayExpenseGroup[];
}

/**
 * 서버 응답을 클라이언트 Expense 타입으로 변환
 */
function toExpense(e: ExpenseResponse, fallbackDate?: string, fallbackTime?: string): Expense {
  return {
    id: e.id,
    tripId: e.tripId,
    destinationId: e.destinationId,
    amount: Number(e.amount),
    currency: e.currency,
    amountKRW: Number(e.amountKRW),
    exchangeRate: Number(e.exchangeRate),
    category: e.category,
    memo: e.memo,
    date: parseServerDate(e.expenseDate, fallbackDate),
    time: parseServerTime(e.expenseTime, fallbackTime),
    createdAt: e.createdAt,
  };
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  isLoading: false,
  isInitialized: false,
  error: null,

  loadExpenses: async (tripId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await expenseApi.getByTrip(tripId);
      const expenses: Expense[] = data.map((e) => toExpense(e));
      set({ expenses, isLoading: false, isInitialized: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : '지출 내역을 불러오는데 실패했습니다';
      set({ isLoading: false, isInitialized: true, error: message });
      throw error;
    }
  },

  createExpense: async (expenseData) => {
    const dto: CreateExpenseDto = {
      destinationId: expenseData.destinationId,
      amount: expenseData.amount,
      currency: expenseData.currency,
      exchangeRate: expenseData.exchangeRate,
      amountKRW: expenseData.amountKRW,
      category: expenseData.category,
      memo: expenseData.memo,
      expenseDate: expenseData.date,
      expenseTime: expenseData.time,
    };

    const { data } = await expenseApi.create(expenseData.tripId, dto);
    const expense = toExpense(data, expenseData.date, expenseData.time);

    set((state) => ({ expenses: [expense, ...state.expenses] }));
    return expense;
  },

  updateExpense: async (expense) => {
    await expenseApi.update(expense.id, {
      destinationId: expense.destinationId,
      amount: expense.amount,
      currency: expense.currency,
      exchangeRate: expense.exchangeRate,
      amountKRW: expense.amountKRW,
      category: expense.category,
      memo: expense.memo,
      expenseDate: expense.date,
      expenseTime: expense.time,
    });

    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === expense.id ? expense : e)),
    }));
  },

  deleteExpense: async (id) => {
    await expenseApi.delete(id);
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));
  },

  getExpenseById: (id) => {
    return get().expenses.find((e) => e.id === id) || null;
  },

  clearError: () => set({ error: null }),

  getStats: (tripId) => {
    const expenses = get().expenses.filter((e) => e.tripId === tripId);

    const stats: ExpenseStats = {
      totalKRW: 0,
      totalLocal: {},
      byCategory: {} as Record<Category, number>,
      byDate: {},
      byDestination: {},
      byCurrency: {},
    };

    for (const expense of expenses) {
      stats.totalKRW += expense.amountKRW;

      // 통화별 합계
      stats.totalLocal[expense.currency] =
        (stats.totalLocal[expense.currency] || 0) + expense.amount;

      // 카테고리별 (원화 기준)
      stats.byCategory[expense.category] =
        (stats.byCategory[expense.category] || 0) + expense.amountKRW;

      // 날짜별
      stats.byDate[expense.date] =
        (stats.byDate[expense.date] || 0) + expense.amountKRW;

      // 방문지별
      if (expense.destinationId) {
        stats.byDestination[expense.destinationId] =
          (stats.byDestination[expense.destinationId] || 0) + expense.amountKRW;
      }

      // 통화별 상세
      if (!stats.byCurrency[expense.currency]) {
        stats.byCurrency[expense.currency] = { amount: 0, amountKRW: 0 };
      }
      stats.byCurrency[expense.currency].amount += expense.amount;
      stats.byCurrency[expense.currency].amountKRW += expense.amountKRW;
    }

    return stats;
  },

  getTotalByTrip: (tripId) => {
    const expenses = get().expenses.filter((e) => e.tripId === tripId);
    return expenses.reduce((sum, e) => sum + e.amountKRW, 0);
  },

  getTodayTotal: (tripId) => {
    const todayStr = formatDate(new Date());
    const todayExpenses = get().expenses.filter(
      (e) => e.tripId === tripId && e.date === todayStr
    );

    const byCurrency: Record<string, number> = {};
    let totalKRW = 0;

    for (const expense of todayExpenses) {
      byCurrency[expense.currency] = (byCurrency[expense.currency] || 0) + expense.amount;
      totalKRW += expense.amountKRW;
    }

    return { totalKRW, byCurrency };
  },

  getTotalLocal: (tripId) => {
    const tripExpenses = get().expenses.filter((e) => e.tripId === tripId);
    const localAmounts: Record<string, number> = {};

    for (const expense of tripExpenses) {
      localAmounts[expense.currency] = (localAmounts[expense.currency] || 0) + expense.amount;
    }

    return Object.entries(localAmounts)
      .map(([currency, amount]) => ({ currency, amount }))
      .sort((a, b) => b.amount - a.amount);
  },

  // PRD FR-008: 특정 날짜의 지출을 국가별로 그룹화
  getExpensesByDateGrouped: (tripId, date, destinations) => {
    const dayExpenses = get().expenses.filter(
      (e) => e.tripId === tripId && e.date === date
    );
    const groups: DayExpenseGroup[] = [];

    // 방문지별로 그룹화
    const grouped = new Map<string, Expense[]>();

    for (const expense of dayExpenses) {
      const destId = expense.destinationId || 'unknown';
      const list = grouped.get(destId) || [];
      list.push(expense);
      grouped.set(destId, list);
    }

    // DayExpenseGroup 배열로 변환
    for (const [destId, expenses] of grouped) {
      const destination = destinations.find((d) => d.id === destId);
      if (destination) {
        const totalLocal = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalKRW = expenses.reduce((sum, e) => sum + e.amountKRW, 0);

        groups.push({
          date,
          destination,
          expenses,
          totalLocal,
          totalKRW,
        });
      }
    }

    // 방문 순서대로 정렬
    return groups.sort(
      (a, b) => a.destination.orderIndex - b.destination.orderIndex
    );
  },
}));

// 하위 호환성을 위한 alias (loadExpensesFromServer -> loadExpenses)
// 기존 코드에서 loadExpensesFromServer를 호출하는 곳이 있을 수 있음
export const loadExpensesFromServer = (tripId: string) =>
  useExpenseStore.getState().loadExpenses(tripId);
