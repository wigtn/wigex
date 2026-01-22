// Shared Constants

export const CATEGORIES = ['food', 'transport', 'shopping', 'lodging', 'activity', 'etc'] as const;
export type Category = (typeof CATEGORIES)[number];

export const PAYMENT_METHODS = ['card', 'cash', 'wallet'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const WALLET_TRANSACTION_TYPES = ['deposit', 'withdraw', 'adjust'] as const;
export type WalletTransactionType = (typeof WALLET_TRANSACTION_TYPES)[number];

export const TRIP_STATUS = ['active', 'completed', 'cancelled'] as const;
export type TripStatus = (typeof TRIP_STATUS)[number];

export const SUPPORTED_CURRENCIES = [
  'JPY', 'USD', 'EUR', 'GBP', 'CNY', 'THB', 'VND', 'TWD',
  'PHP', 'SGD', 'AUD', 'CAD', 'CHF', 'CZK', 'HKD', 'MYR', 'NZD', 'IDR'
] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  food: '식비',
  transport: '교통',
  shopping: '쇼핑',
  lodging: '숙박',
  activity: '관광',
  etc: '기타',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  food: 'restaurant',
  transport: 'directions-bus',
  shopping: 'shopping-bag',
  lodging: 'hotel',
  activity: 'local-activity',
  etc: 'more-horiz',
};
