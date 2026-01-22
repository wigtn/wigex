// Travel Helper v2.0 - Database Schema

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'travel_expense_v2.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await initDatabase(db);
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- 여행 테이블 (v2: country, currency 제거)
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      budget REAL,
      coverImage TEXT,
      createdAt TEXT NOT NULL
    );

    -- 방문지 테이블 (v2 신규)
    CREATE TABLE IF NOT EXISTS destinations (
      id TEXT PRIMARY KEY,
      tripId TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT,
      currency TEXT NOT NULL,
      startDate TEXT,
      endDate TEXT,
      orderIndex INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_destinations_tripId ON destinations(tripId);

    -- 환전 지갑 테이블 (v2 신규)
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      tripId TEXT NOT NULL,
      currency TEXT NOT NULL,
      name TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_wallets_tripId ON wallets(tripId);

    -- 지갑 거래 내역 테이블 (v2 신규)
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      walletId TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      exchangeRate REAL,
      memo TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (walletId) REFERENCES wallets(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_wallet_transactions_walletId ON wallet_transactions(walletId);

    -- 지출 테이블 (v2: 새 컬럼 추가)
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      tripId TEXT NOT NULL,
      destinationId TEXT,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      amountKRW REAL NOT NULL,
      exchangeRate REAL NOT NULL,
      paymentMethod TEXT DEFAULT 'card',
      walletId TEXT,
      category TEXT NOT NULL,
      memo TEXT,
      date TEXT NOT NULL,
      time TEXT,
      receiptImage TEXT,
      ocrProcessed INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (destinationId) REFERENCES destinations(id) ON DELETE SET NULL,
      FOREIGN KEY (walletId) REFERENCES wallets(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_tripId ON expenses(tripId);
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_destinationId ON expenses(destinationId);

    -- 환율 캐시 테이블 (유지)
    CREATE TABLE IF NOT EXISTS exchange_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rates TEXT NOT NULL,
      lastUpdated TEXT NOT NULL
    );
  `);
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

// 마이그레이션: 기존 v1 데이터가 있으면 v2 형식으로 변환
export async function migrateFromV1(): Promise<void> {
  const database = await getDatabase();

  // v1 DB가 있는지 확인
  try {
    const oldDb = await SQLite.openDatabaseAsync('travel_expense.db');

    // 기존 trips 조회
    const oldTrips = await oldDb.getAllAsync<{
      id: string;
      name: string;
      country: string;
      currency: string;
      startDate: string;
      endDate: string;
      budget: number | null;
      createdAt: string;
    }>('SELECT * FROM trips');

    for (const trip of oldTrips) {
      // 이미 마이그레이션된 trip인지 확인
      const exists = await database.getFirstAsync(
        'SELECT id FROM trips WHERE id = ?',
        [trip.id]
      );
      if (exists) continue;

      // trip 삽입 (country, currency 제외)
      await database.runAsync(
        `INSERT INTO trips (id, name, startDate, endDate, budget, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [trip.id, trip.name, trip.startDate, trip.endDate, trip.budget, trip.createdAt]
      );

      // destination 자동 생성
      const destinationId = `dest_${trip.id}`;
      await database.runAsync(
        `INSERT INTO destinations (id, tripId, country, city, currency, startDate, endDate, orderIndex, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [destinationId, trip.id, trip.country, null, trip.currency, trip.startDate, trip.endDate, 0, trip.createdAt]
      );

      // 기존 expenses 마이그레이션
      const oldExpenses = await oldDb.getAllAsync<{
        id: string;
        tripId: string;
        amount: number;
        currency: string;
        amountKRW: number;
        exchangeRate: number;
        category: string;
        memo: string | null;
        date: string;
        createdAt: string;
      }>('SELECT * FROM expenses WHERE tripId = ?', [trip.id]);

      for (const expense of oldExpenses) {
        await database.runAsync(
          `INSERT INTO expenses (id, tripId, destinationId, amount, currency, amountKRW, exchangeRate, paymentMethod, category, memo, date, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [expense.id, expense.tripId, destinationId, expense.amount, expense.currency, expense.amountKRW, expense.exchangeRate, 'card', expense.category, expense.memo, expense.date, expense.createdAt]
        );
      }
    }

    await oldDb.closeAsync();
  } catch {
    // v1 DB가 없으면 마이그레이션 스킵
  }
}
