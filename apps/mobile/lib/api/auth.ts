import { apiClient } from './client';
import { AuthTokens } from '../services/tokenService';

// ============ Types ============

export interface User {
  id: string;
  email: string;
  name?: string;
  provider?: 'local' | 'apple' | 'google';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SocialLoginDto {
  provider: 'apple' | 'google';
  idToken: string;
  name?: string; // For Apple first login
  email?: string; // For Apple first login (if provided)
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

// ============ API Functions ============

export const authApi = {
  register: (dto: RegisterDto) =>
    apiClient.post<AuthResponse>('/auth/register', dto),

  login: (dto: LoginDto) => apiClient.post<AuthResponse>('/auth/login', dto),

  socialLogin: (dto: SocialLoginDto) =>
    apiClient.post<AuthResponse>('/auth/social', dto),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthTokens>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  me: () => apiClient.get<{ success: true; data: User }>('/auth/me'),

  forgotPassword: (dto: ForgotPasswordDto) =>
    apiClient.post('/auth/forgot-password', dto),

  resetPassword: (dto: ResetPasswordDto) =>
    apiClient.post('/auth/reset-password', dto),
};
