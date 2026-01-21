// Travel Helper v2.0 - Expense Store

import { create } from 'zustand';
import { generateId } from '../utils/uuid';
import { Expense, ExpenseStats } from '../types';
import { Category, PaymentMethod } from '../utils/constants';
import * as queries from '../db/queries';
import { useWalletStore } from './walletStore';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;

  // 액션들
  loadExpenses: (tripId: string) => Promise<void>;
  createExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<Expense>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // 통계
  getStats: (tripId: string) => ExpenseStats;
  getTotalByTrip: (tripId: string) => Promise<number>;
  getTodayTotal: (tripId: string) => Promise<{ totalKRW: number; byCurrency: Record<string, number> }>;
  getExpensesByCurrency: (tripId: string) => Promise<Record<string, { amount: number; amountKRW: number }>>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  isLoading: false,

  loadExpenses: async (tripId) => {
    set({ isLoading: true });
    try {
      const expenses = await queries.getExpensesByTripId(tripId);
      set({ expenses, isLoading: false });
    } catch (error) {
      console.error('Failed to load expenses:', error);
      set({ isLoading: false });
    }
  },

  createExpense: async (expenseData) => {
    const expense: Expense = {
      ...expenseData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    await queries.createExpense(expense);

    // 지갑 결제인 경우 지갑에서 차감
    if (expense.paymentMethod === 'wallet' && expense.walletId) {
      await useWalletStore.getState().addWithdraw(
        expense.walletId,
        expense.amount,
        expense.memo || '지출'
      );
    }

    set((state) => ({ expenses: [expense, ...state.expenses] }));
    return expense;
  },

  updateExpense: async (expense) => {
    const oldExpense = get().expenses.find(e => e.id === expense.id);

    // 기존 지갑 결제였다면 원복
    if (oldExpense?.paymentMethod === 'wallet' && oldExpense.walletId) {
      // 기존 차감 취소 (입금 처리)
      await useWalletStore.getState().addDeposit(
        oldExpense.walletId,
        oldExpense.amount,
        undefined,
        '지출 수정 - 취소'
      );
    }

    // 새 지갑 결제라면 차감
    if (expense.paymentMethod === 'wallet' && expense.walletId) {
      await useWalletStore.getState().addWithdraw(
        expense.walletId,
        expense.amount,
        expense.memo || '지출 수정'
      );
    }

    await queries.updateExpense(expense);
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === expense.id ? expense : e)),
    }));
  },

  deleteExpense: async (id) => {
    const expense = get().expenses.find(e => e.id === id);

    // 지갑 결제였다면 잔액 복구
    if (expense?.paymentMethod === 'wallet' && expense.walletId) {
      await useWalletStore.getState().addDeposit(
        expense.walletId,
        expense.amount,
        undefined,
        '지출 삭제 - 환불'
      );
    }

    await queries.deleteExpense(id);
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));
  },

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
      stats.totalLocal[expense.currency] = (stats.totalLocal[expense.currency] || 0) + expense.amount;

      // 카테고리별 (원화 기준)
      stats.byCategory[expense.category] = (stats.byCategory[expense.category] || 0) + expense.amountKRW;

      // 날짜별
      stats.byDate[expense.date] = (stats.byDate[expense.date] || 0) + expense.amountKRW;

      // 방문지별
      if (expense.destinationId) {
        stats.byDestination[expense.destinationId] = (stats.byDestination[expense.destinationId] || 0) + expense.amountKRW;
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

  getTotalByTrip: async (tripId) => {
    return await queries.getTotalExpenseByTrip(tripId);
  },

  getTodayTotal: async (tripId) => {
    return await queries.getTodayExpenseByTrip(tripId);
  },

  getExpensesByCurrency: async (tripId) => {
    return await queries.getExpensesByCurrency(tripId);
  },
}));
