import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { tokenService, AuthTokens } from '../services/tokenService';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Retry configuration with exponential backoff
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

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
  baseURL: API_BASE_URL,
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
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
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

        const { data } = await axios.post<AuthTokens>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        await tokenService.setTokens(data);

        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
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

// Helper for extracting error messages
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string | string[];
      error?: string;
    }>;
    const data = axiosError.response?.data;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
    if (data?.error) {
      return data.error;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
