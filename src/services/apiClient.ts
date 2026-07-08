// Central API client configuration
// Direct API calls without mock data

import { authService } from './authService';
import { UploadResult } from './types/backend-api.types';

export class ApiError extends Error {
  status: number;
  payload: any;
  code?: string;
  constructor(message: string, status: number, payload: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
    this.code = payload?.code;
  }
}

function shouldRetry(status: number): boolean {
  return [408, 429, 500, 502, 503, 504].includes(status);
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try { return JSON.parse(text); } catch { return {} as T; }
}

async function request<T = any>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const tokens = await authService.getTokens();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (tokens.access) headers['Authorization'] = `Bearer ${tokens.access}`;

  let res: Response;
  try {
    res = await fetch(`${window.location.origin}${path}`, { ...init, headers });
  } catch (error: any) {
    if (retry) {
      await new Promise((r) => setTimeout(r, 400));
      return request<T>(path, init, false);
    }
    throw new ApiError(error?.message || 'Network error', 0, { code: 'NETWORK_ERROR' });
  }

  if (res.status === 401 && retry && tokens.refresh) {
    try {
      const refreshRes = await fetch(`${window.location.origin}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refresh }),
      });
      if (refreshRes.ok) {
        const payload = await parseJson<any>(refreshRes);
        const newTokens = payload?.data?.tokens;
        if (newTokens) {
          await authService.saveTokens(newTokens.accessToken, newTokens.refreshToken);
          return request<T>(path, init, false);
        }
      }
    } catch {
      // refresh failed, continue to error handling
    }
  }

  if (!res.ok) {
    const payload = await parseJson<any>(res);
    throw new ApiError(payload?.message || `Request failed with status ${res.status}`, res.status, payload);
  }

  return parseJson<T>(res);
}

export async function getJson<T = any>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

export async function postJson<T = any>(path: string, body: any): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function putJson<T = any>(path: string, body: any): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

export async function deleteJson<T = any>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export async function postFormData<T = any>(path: string, formData: FormData): Promise<T> {
  const tokens = await authService.getTokens();
  const headers: Record<string, string> = {};
  if (tokens.access) headers['Authorization'] = `Bearer ${tokens.access}`;

  let res: Response;
  try {
    res = await fetch(`${window.location.origin}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch (error: any) {
    throw new ApiError(error?.message || 'Network error', 0, { code: 'NETWORK_ERROR' });
  }

  if (res.status === 401 && tokens.refresh) {
    try {
      const refreshRes = await fetch(`${window.location.origin}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refresh }),
      });
      if (refreshRes.ok) {
        const payload = await parseJson<any>(refreshRes);
        const newTokens = payload?.data?.tokens;
        if (newTokens) {
          await authService.saveTokens(newTokens.accessToken, newTokens.refreshToken);
          return postFormData<T>(path, formData);
        }
      }
    } catch {
      // refresh failed, continue to error handling
    }
  }

  if (!res.ok) {
    const payload = await parseJson<any>(res);
    throw new ApiError(payload?.message || `Request failed with status ${res.status}`, res.status, payload);
  }

  return parseJson<T>(res);
}

export default {
  getJson,
  postJson,
  putJson,
  deleteJson,
  postFormData,
};