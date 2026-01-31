// Travel Helper v3.0 - Auth Store (Server-only)

import { create } from 'zustand';
import { authApi, User, AuthResponse } from '../api/auth';
import { tokenService } from '../services/tokenService';
import { onAuthExpired, getErrorMessage } from '../api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name?: string
  ) => Promise<void>;
  socialLogin: (
    provider: 'apple' | 'google',
    idToken: string,
    name?: string,
    email?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Handle successful auth
async function handleAuthSuccess(response: AuthResponse): Promise<User> {
  await tokenService.setTokens(response.tokens);
  await tokenService.setUser({
    id: response.user.id,
    email: response.user.email,
    name: response.user.name,
  });

  return response.user;
}

// 구독 해제 함수를 저장
let authExpiredUnsubscribe: (() => void) | null = null;
// 초기화 여부 추적 (중복 구독 방지)
let isStoreInitialized = false;

export const useAuthStore = create<AuthState>((set, get) => {
  // 중복 구독 방지
  if (!isStoreInitialized) {
    isStoreInitialized = true;
    // Subscribe to auth expiration events from API client
    authExpiredUnsubscribe = onAuthExpired(() => {
      set({ user: null, isAuthenticated: false });
    });
  }

  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,

    initialize: async () => {
      // 이미 초기화 중이면 무시 (레이스 컨디션 방지)
      if (get().isLoading) return;

      set({ isLoading: true });

      try {
        const token = await tokenService.getAccessToken();
        const isExpired = await tokenService.isTokenExpired();

        if (token && !isExpired) {
          // Try to get user info from stored data first
          const storedUser = await tokenService.getUser();
          if (storedUser) {
            set({
              user: {
                id: storedUser.id,
                email: storedUser.email,
                name: storedUser.name,
                createdAt: '',
                updatedAt: '',
              },
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false,
            });

            // Refresh user info in background (레이스 컨디션 방지)
            // 현재 인증 상태를 확인하고 여전히 인증된 경우에만 업데이트
            authApi.me().then(({ data }) => {
              const currentState = get();
              if (currentState.isAuthenticated && currentState.user?.id === storedUser.id) {
                set({ user: data.data });
              }
            }).catch(() => {
              // Ignore background refresh errors
            });
            return;
          }

          // No stored user, try to fetch
          try {
            const { data } = await authApi.me();
            await tokenService.setUser({
              id: data.data.id,
              email: data.data.email,
              name: data.data.name,
            });
            set({
              user: data.data,
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false,
            });
            return;
          } catch {
            // Token invalid, clear it
            await tokenService.clearTokens();
          }
        } else if (token && isExpired) {
          // Try to refresh token
          try {
            const refreshToken = await tokenService.getRefreshToken();
            if (refreshToken) {
              const { data } = await authApi.refresh(refreshToken);
              await tokenService.setTokens(data);

              const storedUser = await tokenService.getUser();
              if (storedUser) {
                set({
                  user: {
                    id: storedUser.id,
                    email: storedUser.email,
                    name: storedUser.name,
                    createdAt: '',
                    updatedAt: '',
                  },
                  isAuthenticated: true,
                  isInitialized: true,
                  isLoading: false,
                });
                return;
              }
            }
          } catch {
            await tokenService.clearTokens();
          }
        }

        set({ isInitialized: true, isLoading: false });
      } catch {
        await tokenService.clearTokens();
        set({ isInitialized: true, isLoading: false });
      }
    },

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        const { data } = await authApi.login({ email, password });
        const user = await handleAuthSuccess(data);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        const message = getErrorMessage(error);
        set({ error: message, isLoading: false });
        throw error;
      }
    },

    register: async (email, password, name) => {
      set({ isLoading: true, error: null });
      try {
        const { data } = await authApi.register({ email, password, name });
        const user = await handleAuthSuccess(data);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        const message = getErrorMessage(error);
        set({ error: message, isLoading: false });
        throw error;
      }
    },

    socialLogin: async (provider, idToken, name, email) => {
      set({ isLoading: true, error: null });
      try {
        const { data } = await authApi.socialLogin({
          provider,
          idToken,
          name,
          email,
        });
        const user = await handleAuthSuccess(data);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        const message = getErrorMessage(error);
        set({ error: message, isLoading: false });
        throw error;
      }
    },

    logout: async () => {
      // 로그아웃 중 다른 작업 방지
      const currentState = get();
      if (!currentState.isAuthenticated) return;

      // 먼저 로컬 상태 초기화 (레이스 컨디션 방지)
      set({ user: null, isAuthenticated: false, error: null });

      try {
        const refreshToken = await tokenService.getRefreshToken();
        if (refreshToken) {
          await authApi.logout(refreshToken).catch(() => {
            // Ignore logout API errors
          });
        }
      } finally {
        await tokenService.clearTokens();
      }
    },

    clearError: () => set({ error: null }),
  };
});

// 앱 종료 시 구독 해제 (필요한 경우)
export const cleanupAuthStore = () => {
  if (authExpiredUnsubscribe) {
    authExpiredUnsubscribe();
    authExpiredUnsubscribe = null;
  }
  isStoreInitialized = false;
};
