// API Response Types

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// Auth Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface SocialLoginDto {
  provider: 'apple' | 'google';
  idToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  provider: 'local' | 'apple' | 'google';
  createdAt: string;
}

// Exchange Rate
export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

export interface ConvertCurrencyDto {
  from: string;
  to: string;
  amount: number;
}

export interface ConvertCurrencyResponse {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
}
