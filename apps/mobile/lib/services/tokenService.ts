import * as SecureStore from 'expo-secure-store';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  TOKEN_EXPIRY: 'auth_token_expiry',
  USER: 'auth_user',
} as const;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface StoredUser {
  id: string;
  email: string;
  name?: string;
}

export const tokenService = {
  async setTokens(tokens: AuthTokens): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await SecureStore.setItemAsync(
      TOKEN_KEYS.REFRESH_TOKEN,
      tokens.refreshToken
    );
    const expiry = Date.now() + tokens.expiresIn * 1000;
    await SecureStore.setItemAsync(TOKEN_KEYS.TOKEN_EXPIRY, expiry.toString());
  },

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
  },

  async isTokenExpired(): Promise<boolean> {
    const expiry = await SecureStore.getItemAsync(TOKEN_KEYS.TOKEN_EXPIRY);
    if (!expiry) return true;
    // Refresh 2 minutes before actual expiry for smoother UX
    return Date.now() > parseInt(expiry, 10) - 120000;
  },

  async setUser(user: StoredUser): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEYS.USER, JSON.stringify(user));
  },

  async getUser(): Promise<StoredUser | null> {
    const userStr = await SecureStore.getItemAsync(TOKEN_KEYS.USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as StoredUser;
    } catch {
      return null;
    }
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(TOKEN_KEYS.TOKEN_EXPIRY),
      SecureStore.deleteItemAsync(TOKEN_KEYS.USER),
    ]);
  },

  async hasValidSession(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return false;
    const expired = await this.isTokenExpired();
    return !expired;
  },
};
