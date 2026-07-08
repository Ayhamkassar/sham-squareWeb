import { API_BASE_URL } from '../config/env';
import { storage } from './storage';
import { getJson, postJson } from './apiClient';

const ACCESS_KEY = '@sham_presto/accessToken';
const REFRESH_KEY = '@sham_presto/refreshToken';

interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      role?: string;
      avatar?: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

interface MeResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      role?: string;
      avatar?: string;
    };
  };
}

export const authService = {
  async saveTokens(accessToken: string, refreshToken: string) {
    await storage.setItem(ACCESS_KEY, accessToken);
    await storage.setItem(REFRESH_KEY, refreshToken);
  },

  async clearTokens() {
    await storage.removeItem(ACCESS_KEY);
    await storage.removeItem(REFRESH_KEY);
  },

  async getTokens(): Promise<{ access?: string; refresh?: string }> {
    const access = await storage.getItem(ACCESS_KEY);
    const refresh = await storage.getItem(REFRESH_KEY);
    return { access: access ?? undefined, refresh: refresh ?? undefined };
  },

  async login(identifier: string, password: string): Promise<LoginResponse['data']> {
    const isEmail = identifier.includes('@');
    const payload = await postJson<LoginResponse>('/auth/login', {
      [isEmail ? 'email' : 'phone']: identifier,
      password,
    });
    if (payload?.data?.tokens) {
      await this.saveTokens(payload.data.tokens.accessToken, payload.data.tokens.refreshToken);
    }
    return payload.data;
  },

  async register(data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) {
    return postJson('/auth/register', data);
  },

  async getMe(): Promise<MeResponse['data']['user'] | null> {
    try {
      const payload = await getJson<MeResponse>('/auth/me');
      return payload?.data?.user ?? null;
    } catch {
      return null;
    }
  },

  async logout() {
    await this.clearTokens();
  },
};
