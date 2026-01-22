// Travel Helper v2.0 - Wallet Store

import { create } from 'zustand';
import { generateId } from '../utils/uuid';
import { Wallet, WalletTransaction, WalletBalance } from '../types';
import { WalletTransactionType } from '../utils/constants';
import * as queries from '../db/queries';

interface WalletState {
  wallets: Wallet[];
  walletBalances: WalletBalance[];
  isLoading: boolean;

  // 액션들
  loadWallets: (tripId: string) => Promise<void>;
  createWallet: (wallet: Omit<Wallet, 'id' | 'createdAt'>) => Promise<Wallet>;
  updateWallet: (wallet: Wallet) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;

  // 거래 관련
  addDeposit: (walletId: string, amount: number, exchangeRate?: number, memo?: string) => Promise<void>;
  addWithdraw: (walletId: string, amount: number, memo?: string) => Promise<void>;
  adjustBalance: (walletId: string, newBalance: number, memo?: string) => Promise<void>;

  // 조회
  getWalletBalance: (walletId: string) => WalletBalance | undefined;
  getWalletByCurrency: (tripId: string, currency: string) => Wallet | undefined;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  walletBalances: [],
  isLoading: false,

  loadWallets: async (tripId) => {
    set({ isLoading: true });
    try {
      const wallets = await queries.getWalletsByTripId(tripId);

      // 각 지갑의 잔액과 거래 내역 로드
      const walletBalances: WalletBalance[] = [];
      for (const wallet of wallets) {
        const transactions = await queries.getWalletTransactions(wallet.id);
        const balance = await queries.getWalletBalance(wallet.id);

        const totalDeposit = transactions
          .filter(t => t.type === 'deposit')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalWithdraw = Math.abs(
          transactions
            .filter(t => t.type === 'withdraw')
            .reduce((sum, t) => sum + t.amount, 0)
        );

        walletBalances.push({
          wallet,
          balance,
          totalDeposit,
          totalWithdraw,
          transactions,
        });
      }

      set({ wallets, walletBalances, isLoading: false });
    } catch (error) {
      console.error('Failed to load wallets:', error);
      set({ isLoading: false });
    }
  },

  createWallet: async (walletData) => {
    const wallet: Wallet = {
      ...walletData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await queries.createWallet(wallet);

    const walletBalance: WalletBalance = {
      wallet,
      balance: 0,
      totalDeposit: 0,
      totalWithdraw: 0,
      transactions: [],
    };

    set((state) => ({
      wallets: [...state.wallets, wallet],
      walletBalances: [...state.walletBalances, walletBalance],
    }));

    return wallet;
  },

  updateWallet: async (wallet) => {
    await queries.updateWallet(wallet);
    set((state) => ({
      wallets: state.wallets.map((w) => (w.id === wallet.id ? wallet : w)),
      walletBalances: state.walletBalances.map((wb) =>
        wb.wallet.id === wallet.id ? { ...wb, wallet } : wb
      ),
    }));
  },

  deleteWallet: async (id) => {
    await queries.deleteWallet(id);
    set((state) => ({
      wallets: state.wallets.filter((w) => w.id !== id),
      walletBalances: state.walletBalances.filter((wb) => wb.wallet.id !== id),
    }));
  },

  addDeposit: async (walletId, amount, exchangeRate, memo) => {
    const transaction: WalletTransaction = {
      id: generateId(),
      walletId,
      type: 'deposit',
      amount: Math.abs(amount),
      exchangeRate,
      memo,
      createdAt: new Date().toISOString(),
    };

    await queries.createWalletTransaction(transaction);

    set((state) => ({
      walletBalances: state.walletBalances.map((wb) => {
        if (wb.wallet.id === walletId) {
          return {
            ...wb,
            balance: wb.balance + Math.abs(amount),
            totalDeposit: wb.totalDeposit + Math.abs(amount),
            transactions: [transaction, ...wb.transactions],
          };
        }
        return wb;
      }),
    }));
  },

  addWithdraw: async (walletId, amount, memo) => {
    const transaction: WalletTransaction = {
      id: generateId(),
      walletId,
      type: 'withdraw',
      amount: -Math.abs(amount),
      memo,
      createdAt: new Date().toISOString(),
    };

    await queries.createWalletTransaction(transaction);

    set((state) => ({
      walletBalances: state.walletBalances.map((wb) => {
        if (wb.wallet.id === walletId) {
          return {
            ...wb,
            balance: wb.balance - Math.abs(amount),
            totalWithdraw: wb.totalWithdraw + Math.abs(amount),
            transactions: [transaction, ...wb.transactions],
          };
        }
        return wb;
      }),
    }));
  },

  adjustBalance: async (walletId, newBalance, memo) => {
    const currentBalance = get().walletBalances.find(wb => wb.wallet.id === walletId)?.balance || 0;
    const adjustAmount = newBalance - currentBalance;

    const transaction: WalletTransaction = {
      id: generateId(),
      walletId,
      type: 'adjust',
      amount: adjustAmount,
      memo: memo || '잔액 수정',
      createdAt: new Date().toISOString(),
    };

    await queries.createWalletTransaction(transaction);

    set((state) => ({
      walletBalances: state.walletBalances.map((wb) => {
        if (wb.wallet.id === walletId) {
          return {
            ...wb,
            balance: newBalance,
            transactions: [transaction, ...wb.transactions],
          };
        }
        return wb;
      }),
    }));
  },

  getWalletBalance: (walletId) => {
    return get().walletBalances.find((wb) => wb.wallet.id === walletId);
  },

  getWalletByCurrency: (tripId, currency) => {
    return get().wallets.find((w) => w.tripId === tripId && w.currency === currency);
  },
}));
