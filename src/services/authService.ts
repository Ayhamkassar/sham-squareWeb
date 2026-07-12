import { API_BASE_URL } from '../config/env';
import { storage } from './storage';
import { getJson, postJson } from './apiClient';

const ACCESS_KEY = '@sham_presto/accessToken';
const REFRESH_KEY = '@sham_presto/refreshToken';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
  avatar?: string;
  departmentId?: string;
}

export interface LoginPayload {
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

interface LoginResponse {
  success: boolean;
  data: LoginPayload;
}

interface MeResponse {
  success: boolean;
  data: {
    user: AuthUser;
  };
}

interface RefreshResponse {
  success: boolean;
  data: {
    tokens: {
      accessToken: string;
      refreshToken: string;
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

  async login(identifier: string, password: string): Promise<LoginPayload> {
    const isEmail = identifier.includes('@');
    const payload = await postJson<LoginResponse>('/web-auth/login', {
      [isEmail ? 'email' : 'phone']: identifier,
      password,
    });
    if (payload?.data?.tokens) {
      await this.saveTokens(payload.data.tokens.accessToken, payload.data.tokens.refreshToken);
    }
    return payload.data;
  },

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<LoginPayload> {
    const payload = await postJson<LoginResponse>('/web-auth/register', data);
    if (payload?.data?.tokens) {
      await this.saveTokens(payload.data.tokens.accessToken, payload.data.tokens.refreshToken);
    }
    return payload.data;
  },

  async getMe(): Promise<AuthUser | null> {
    try {
      const payload = await getJson<MeResponse>('/web-auth/me');
      return payload?.data?.user ?? null;
    } catch {
      return null;
    }
  },

  async refreshAccessToken(): Promise<string | null> {
    const tokens = await this.getTokens();
    if (!tokens.refresh) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refresh }),
      });
      if (res.ok) {
        const payload = await res.json() as RefreshResponse;
        const newAccessToken = payload?.data?.tokens?.accessToken;
        const newRefreshToken = payload?.data?.tokens?.refreshToken;
        if (newAccessToken) {
          await this.saveTokens(newAccessToken, newRefreshToken || tokens.refresh);
          return newAccessToken;
        }
      }
      await this.clearTokens();
      return null;
    } catch {
      return null;
    }
  },

  async forgotPassword(identifier: string): Promise<void> {
    const isEmail = identifier.includes('@');
    await postJson('/auth/forgot-password', {
      [isEmail ? 'email' : 'phone']: identifier,
    });
  },

  async verifyResetCode(identifier: string, code: string): Promise<string | null> {
    const isEmail = identifier.includes('@');
    const payload = await postJson<{ success: boolean; data?: { resetToken?: string } }>('/auth/verify-reset-code', {
      [isEmail ? 'email' : 'phone']: identifier,
      code,
    });
    return payload?.data?.resetToken ?? null;
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    await postJson('/auth/reset-password', { resetToken, password: newPassword });
  },

  async sendOtp(phone: string): Promise<void> {
    await postJson('/web-auth/send-otp', { phone });
  },

  async verifyOtp(phone: string, code: string): Promise<void> {
    await postJson('/web-auth/verify-otp', { phone, code });
  },

  async logout(): Promise<void> {
    try {
      await postJson('/web-auth/logout', {});
    } catch {
      // ignore server logout errors
    }
    await this.clearTokens();
  },
};
