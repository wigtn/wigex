import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { tokenService, AuthTokens } from '../services/tokenService';

// API Base URL - 환경변수 필수 (보안 강화)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  console.warn(
    '[API Client] EXPO_PUBLIC_API_URL is not set. API calls will fail in production.'
  );
}

// 개발/프로덕션 환경 구분
const isDevelopment = __DEV__;

// Retry configuration with exponential backoff
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  // 5xx 에러도 재시도
  retryableStatuses: [500, 502, 503, 504],
};

// 인증 엔드포인트 패턴 (정규식으로 정확한 매칭)
const AUTH_ENDPOINTS = [
  /^\/auth\/login$/,
  /^\/auth\/register$/,
  /^\/auth\/refresh$/,
  /^\/auth\/social$/,
];

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((pattern) => pattern.test(url));
}

// Queue management for concurrent requests during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Event emitter for auth state changes
type AuthEventCallback = () => void;
const authEventListeners: Set<AuthEventCallback> = new Set();

export const onAuthExpired = (callback: AuthEventCallback): (() => void) => {
  authEventListeners.add(callback);
  return () => authEventListeners.delete(callback);
};

const notifyAuthExpired = () => {
  authEventListeners.forEach((callback) => callback());
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle token refresh & retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 - Token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints
      if (isAuthEndpoint(originalRequest.url)) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenService.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // 토큰 갱신 요청도 재시도 로직 적용
        let refreshAttempts = 0;
        let refreshResponse: { data: AuthTokens } | null = null;

        while (refreshAttempts < 2) {
          try {
            refreshResponse = await axios.post<AuthTokens>(
              `${API_BASE_URL}/auth/refresh`,
              { refreshToken },
              { timeout: 10000 }
            );
            break;
          } catch (refreshErr) {
            refreshAttempts++;
            if (refreshAttempts >= 2) throw refreshErr;
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        if (!refreshResponse) {
          throw new Error('Token refresh failed');
        }

        await tokenService.setTokens(refreshResponse.data);

        processQueue(null, refreshResponse.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        await tokenService.clearTokens();
        notifyAuthExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 5xx errors with exponential backoff retry
    const status = error.response?.status;
    if (status && RETRY_CONFIG.retryableStatuses.includes(status)) {
      const retryCount = originalRequest._retryCount || 0;
      if (retryCount < RETRY_CONFIG.maxRetries) {
        originalRequest._retryCount = retryCount + 1;
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(2, retryCount),
          RETRY_CONFIG.maxDelay
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiClient(originalRequest);
      }
    }

    // Handle network errors with exponential backoff retry
    if (!error.response && originalRequest) {
      const retryCount = originalRequest._retryCount || 0;
      if (retryCount < RETRY_CONFIG.maxRetries) {
        originalRequest._retryCount = retryCount + 1;
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(2, retryCount),
          RETRY_CONFIG.maxDelay
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

// 에러 메시지 추출 (민감 정보 마스킹)
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string | string[];
      error?: string;
    }>;
    const data = axiosError.response?.data;

    // 사용자 친화적 메시지 반환 (서버 내부 에러 숨김)
    if (axiosError.response?.status === 500) {
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }

    if (axiosError.response?.status === 503) {
      return '서비스가 일시적으로 이용 불가합니다.';
    }

    // 클라이언트 에러는 서버 메시지 표시 (단, 민감 정보 필터링)
    if (data?.message) {
      const msg = Array.isArray(data.message) ? data.message[0] : data.message;
      // SQL, 경로 등 민감 정보 패턴 필터링
      if (/sql|query|path|stack|error at/i.test(msg)) {
        return '요청을 처리할 수 없습니다.';
      }
      return msg;
    }

    if (data?.error) {
      return data.error;
    }

    // 네트워크 에러
    if (!axiosError.response) {
      return '네트워크 연결을 확인해주세요.';
    }

    // 개발 환경에서만 상세 에러 표시
    if (isDevelopment && axiosError.message) {
      return axiosError.message;
    }
  }

  if (error instanceof Error) {
    // 개발 환경에서만 상세 에러 표시
    if (isDevelopment) {
      return error.message;
    }
  }

  return '오류가 발생했습니다. 다시 시도해주세요.';
}

// 입력값 검증 유틸리티
export const validators = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPassword: (password: string): boolean => {
    // 최소 8자, 영문/숫자 포함
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
  },

  isValidAmount: (amount: number): boolean => {
    return !isNaN(amount) && isFinite(amount) && amount > 0;
  },

  isValidUUID: (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  },

  isValidDateRange: (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
  },
};
