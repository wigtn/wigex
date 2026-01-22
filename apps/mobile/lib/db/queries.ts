// Travel Helper v2.0 - Database Queries

import { getDatabase } from './schema';
import { Trip, Destination, Wallet, WalletTransaction, Expense, ExchangeRateCache } from '../types';

// ============ TRIPS ============

export async function getAllTrips(): Promise<Trip[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<Trip>('SELECT * FROM trips ORDER BY startDate DESC');
  return result;
}

export async function getTripById(id: string): Promise<Trip | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Trip>('SELECT * FROM trips WHERE id = ?', [id]);
  return result || null;
}

export async function getActiveTrips(): Promise<Trip[]> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const result = await db.getAllAsync<Trip>(
    'SELECT * FROM trips WHERE startDate <= ? AND endDate >= ? ORDER BY startDate DESC',
    [today, today]
  );
  return result;
}

export async function createTrip(trip: Trip): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO trips (id, name, startDate, endDate, budget, coverImage, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [trip.id, trip.name, trip.startDate, trip.endDate, trip.budget ?? null, trip.coverImage ?? null, trip.createdAt]
  );
}

export async function updateTrip(trip: Trip): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE trips SET name = ?, startDate = ?, endDate = ?, budget = ?, coverImage = ? WHERE id = ?',
    [trip.name, trip.startDate, trip.endDate, trip.budget ?? null, trip.coverImage ?? null, trip.id]
  );
}

export async function deleteTrip(id: string): Promise<void> {
  const db = await getDatabase();
  // CASCADE로 자동 삭제되지만 명시적으로도 삭제
  await db.runAsync('DELETE FROM expenses WHERE tripId = ?', [id]);
  await db.runAsync('DELETE FROM wallet_transactions WHERE walletId IN (SELECT id FROM wallets WHERE tripId = ?)', [id]);
  await db.runAsync('DELETE FROM wallets WHERE tripId = ?', [id]);
  await db.runAsync('DELETE FROM destinations WHERE tripId = ?', [id]);
  await db.runAsync('DELETE FROM trips WHERE id = ?', [id]);
}

// ============ DESTINATIONS ============

export async function getDestinationsByTripId(tripId: string): Promise<Destination[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<Destination>(
    'SELECT * FROM destinations WHERE tripId = ? ORDER BY orderIndex ASC',
    [tripId]
  );
  return result;
}

export async function getDestinationById(id: string): Promise<Destination | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Destination>('SELECT * FROM destinations WHERE id = ?', [id]);
  return result || null;
}

export async function createDestination(destination: Destination): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO destinations (id, tripId, country, city, currency, startDate, endDate, orderIndex, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      destination.id,
      destination.tripId,
      destination.country,
      destination.city ?? null,
      destination.currency,
      destination.startDate ?? null,
      destination.endDate ?? null,
      destination.orderIndex,
      destination.createdAt,
    ]
  );
}

export async function updateDestination(destination: Destination): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE destinations SET country = ?, city = ?, currency = ?, startDate = ?, endDate = ?, orderIndex = ? WHERE id = ?`,
    [
      destination.country,
      destination.city ?? null,
      destination.currency,
      destination.startDate ?? null,
      destination.endDate ?? null,
      destination.orderIndex,
      destination.id,
    ]
  );
}

export async function deleteDestination(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM destinations WHERE id = ?', [id]);
}

// 현재 날짜 기준으로 해당 여행의 현재 방문지 조회
export async function getCurrentDestination(tripId: string): Promise<Destination | null> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const result = await db.getFirstAsync<Destination>(
    `SELECT * FROM destinations
     WHERE tripId = ? AND startDate <= ? AND endDate >= ?
     ORDER BY orderIndex ASC LIMIT 1`,
    [tripId, today, today]
  );
  if (result) return result;

  // 날짜 범위 내 방문지가 없으면 첫 번째 방문지 반환
  const firstDest = await db.getFirstAsync<Destination>(
    'SELECT * FROM destinations WHERE tripId = ? ORDER BY orderIndex ASC LIMIT 1',
    [tripId]
  );
  return firstDest || null;
}

// ============ WALLETS ============

export async function getWalletsByTripId(tripId: string): Promise<Wallet[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<Wallet>(
    'SELECT * FROM wallets WHERE tripId = ? ORDER BY createdAt ASC',
    [tripId]
  );
  return result;
}

export async function getWalletById(id: string): Promise<Wallet | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Wallet>('SELECT * FROM wallets WHERE id = ?', [id]);
  return result || null;
}

export async function createWallet(wallet: Wallet): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO wallets (id, tripId, currency, name, createdAt) VALUES (?, ?, ?, ?, ?)',
    [wallet.id, wallet.tripId, wallet.currency, wallet.name ?? null, wallet.createdAt]
  );
}

export async function updateWallet(wallet: Wallet): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE wallets SET currency = ?, name = ? WHERE id = ?',
    [wallet.currency, wallet.name ?? null, wallet.id]
  );
}

export async function deleteWallet(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM wallet_transactions WHERE walletId = ?', [id]);
  await db.runAsync('DELETE FROM wallets WHERE id = ?', [id]);
}

// 지갑 잔액 계산
export async function getWalletBalance(walletId: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ balance: number }>(
    'SELECT COALESCE(SUM(amount), 0) as balance FROM wallet_transactions WHERE walletId = ?',
    [walletId]
  );
  return result?.balance ?? 0;
}

// ============ WALLET TRANSACTIONS ============

export async function getWalletTransactions(walletId: string): Promise<WalletTransaction[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<WalletTransaction>(
    'SELECT * FROM wallet_transactions WHERE walletId = ? ORDER BY createdAt DESC',
    [walletId]
  );
  return result;
}

export async function createWalletTransaction(transaction: WalletTransaction): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO wallet_transactions (id, walletId, type, amount, exchangeRate, memo, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      transaction.id,
      transaction.walletId,
      transaction.type,
      transaction.amount,
      transaction.exchangeRate ?? null,
      transaction.memo ?? null,
      transaction.createdAt,
    ]
  );
}

export async function deleteWalletTransaction(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM wallet_transactions WHERE id = ?', [id]);
}

// ============ EXPENSES ============

export async function getExpensesByTripId(tripId: string): Promise<Expense[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<Expense>(
    'SELECT * FROM expenses WHERE tripId = ? ORDER BY date DESC, time DESC, createdAt DESC',
    [tripId]
  );
  return result;
}

export async function getExpensesByDate(tripId: string, date: string): Promise<Expense[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<Expense>(
    'SELECT * FROM expenses WHERE tripId = ? AND date = ? ORDER BY time DESC, createdAt DESC',
    [tripId, date]
  );
  return result;
}

export async function getExpensesByDestination(destinationId: string): Promise<Expense[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<Expense>(
    'SELECT * FROM expenses WHERE destinationId = ? ORDER BY date DESC, time DESC, createdAt DESC',
    [destinationId]
  );
  return result;
}

export async function createExpense(expense: Expense): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO expenses (id, tripId, destinationId, amount, currency, amountKRW, exchangeRate,
     paymentMethod, walletId, category, memo, date, time, receiptImage, ocrProcessed, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      expense.id,
      expense.tripId,
      expense.destinationId ?? null,
      expense.amount,
      expense.currency,
      expense.amountKRW,
      expense.exchangeRate,
      expense.paymentMethod,
      expense.walletId ?? null,
      expense.category,
      expense.memo ?? null,
      expense.date,
      expense.time ?? null,
      expense.receiptImage ?? null,
      expense.ocrProcessed ? 1 : 0,
      expense.createdAt,
    ]
  );
}

export async function updateExpense(expense: Expense): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE expenses SET destinationId = ?, amount = ?, currency = ?, amountKRW = ?, exchangeRate = ?,
     paymentMethod = ?, walletId = ?, category = ?, memo = ?, date = ?, time = ?,
     receiptImage = ?, ocrProcessed = ? WHERE id = ?`,
    [
      expense.destinationId ?? null,
      expense.amount,
      expense.currency,
      expense.amountKRW,
      expense.exchangeRate,
      expense.paymentMethod,
      expense.walletId ?? null,
      expense.category,
      expense.memo ?? null,
      expense.date,
      expense.time ?? null,
      expense.receiptImage ?? null,
      expense.ocrProcessed ? 1 : 0,
      expense.id,
    ]
  );
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
}

export async function getTotalExpenseByTrip(tripId: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amountKRW), 0) as total FROM expenses WHERE tripId = ?',
    [tripId]
  );
  return result?.total ?? 0;
}

export async function getTodayExpenseByTrip(tripId: string): Promise<{ totalKRW: number; byCurrency: Record<string, number> }> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  const totalResult = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amountKRW), 0) as total FROM expenses WHERE tripId = ? AND date = ?',
    [tripId, today]
  );

  const byCurrencyResult = await db.getAllAsync<{ currency: string; total: number }>(
    'SELECT currency, COALESCE(SUM(amount), 0) as total FROM expenses WHERE tripId = ? AND date = ? GROUP BY currency',
    [tripId, today]
  );

  const byCurrency: Record<string, number> = {};
  for (const row of byCurrencyResult) {
    byCurrency[row.currency] = row.total;
  }

  return {
    totalKRW: totalResult?.total ?? 0,
    byCurrency,
  };
}

// 통화별 총 지출
export async function getExpensesByCurrency(tripId: string): Promise<Record<string, { amount: number; amountKRW: number }>> {
  const db = await getDatabase();
  const result = await db.getAllAsync<{ currency: string; totalAmount: number; totalKRW: number }>(
    `SELECT currency, SUM(amount) as totalAmount, SUM(amountKRW) as totalKRW
     FROM expenses WHERE tripId = ? GROUP BY currency`,
    [tripId]
  );

  const byCurrency: Record<string, { amount: number; amountKRW: number }> = {};
  for (const row of result) {
    byCurrency[row.currency] = { amount: row.totalAmount, amountKRW: row.totalKRW };
  }
  return byCurrency;
}

// ============ EXCHANGE RATES ============

export async function getExchangeRates(): Promise<ExchangeRateCache | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ rates: string; lastUpdated: string }>(
    'SELECT rates, lastUpdated FROM exchange_rates ORDER BY id DESC LIMIT 1'
  );
  if (!result) return null;
  return {
    rates: JSON.parse(result.rates),
    lastUpdated: result.lastUpdated,
  };
}

export async function saveExchangeRates(cache: ExchangeRateCache): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM exchange_rates');
  await db.runAsync(
    'INSERT INTO exchange_rates (rates, lastUpdated) VALUES (?, ?)',
    [JSON.stringify(cache.rates), cache.lastUpdated]
  );
}
