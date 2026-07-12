import { API_BASE_URL } from '../config/env';
import { authService } from './authService';

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

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

async function processRefreshQueue(newToken: string) {
  const queue = [...refreshQueue];
  refreshQueue = [];
  queue.forEach(({ resolve }) => resolve(newToken));
}

async function failRefreshQueue(err: any) {
  const queue = [...refreshQueue];
  refreshQueue = [];
  queue.forEach(({ reject }) => reject(err));
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
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch (error: any) {
    if (retry) {
      await new Promise((r) => setTimeout(r, 400));
      return request<T>(path, init, false);
    }
    throw new ApiError(error?.message || 'Network error', 0, { code: 'NETWORK_ERROR' });
  }

  if (res.status === 401 && tokens.refresh) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokens.refresh }),
        });
        if (refreshRes.ok) {
          const payload = await parseJson<any>(refreshRes);
          const newAccessToken = payload?.data?.tokens?.accessToken || payload?.accessToken;
          if (newAccessToken) {
            await authService.saveTokens(newAccessToken, tokens.refresh);
            processRefreshQueue(newAccessToken);
            isRefreshing = false;
            headers['Authorization'] = `Bearer ${newAccessToken}`;
            res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
            if (!res.ok) {
              const errPayload = await parseJson<any>(res);
              throw new ApiError(errPayload?.message || `Request failed with status ${res.status}`, res.status, errPayload);
            }
            return parseJson<T>(res);
          }
        }
        await authService.clearTokens();
        failRefreshQueue(new Error('Refresh failed'));
        isRefreshing = false;
        throw new ApiError('Session expired', 401, { code: 'SESSION_EXPIRED' });
      } catch (refreshError) {
        isRefreshing = false;
        failRefreshQueue(refreshError);
        throw refreshError instanceof ApiError ? refreshError : new ApiError('Session expired', 401, { code: 'SESSION_EXPIRED' });
      }
    } else {
      return new Promise<T>((resolve, reject) => {
        refreshQueue.push({
          resolve: async (newToken: string) => {
            headers['Authorization'] = `Bearer ${newToken}`;
            try {
              const retryRes = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
              if (!retryRes.ok) {
                const errPayload = await parseJson<any>(retryRes);
                reject(new ApiError(errPayload?.message || `Request failed`, retryRes.status, errPayload));
                return;
              }
              resolve(await parseJson<T>(retryRes));
            } catch (err) {
              reject(err);
            }
          },
          reject: (err) => reject(err),
        });
      });
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
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch (error: any) {
    throw new ApiError(error?.message || 'Network error', 0, { code: 'NETWORK_ERROR' });
  }

  if (res.status === 401 && tokens.refresh) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokens.refresh }),
        });
        if (refreshRes.ok) {
          const payload = await parseJson<any>(refreshRes);
          const newAccessToken = payload?.data?.tokens?.accessToken || payload?.accessToken;
          if (newAccessToken) {
            await authService.saveTokens(newAccessToken, tokens.refresh);
            processRefreshQueue(newAccessToken);
            isRefreshing = false;
            headers['Authorization'] = `Bearer ${newAccessToken}`;
            res = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers, body: formData });
            if (!res.ok) {
              const errPayload = await parseJson<any>(res);
              throw new ApiError(errPayload?.message || `Request failed`, res.status, errPayload);
            }
            return parseJson<T>(res);
          }
        }
        await authService.clearTokens();
        failRefreshQueue(new Error('Refresh failed'));
        isRefreshing = false;
        throw new ApiError('Session expired', 401, { code: 'SESSION_EXPIRED' });
      } catch (err) {
        isRefreshing = false;
        failRefreshQueue(err);
        throw err;
      }
    } else {
      return new Promise<T>((resolve, reject) => {
        refreshQueue.push({
          resolve: async (newToken: string) => {
            headers['Authorization'] = `Bearer ${newToken}`;
            try {
              const retryRes = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers, body: formData });
              if (!retryRes.ok) {
                const errPayload = await parseJson<any>(retryRes);
                reject(new ApiError(errPayload?.message || `Request failed`, retryRes.status, errPayload));
                return;
              }
              resolve(await parseJson<T>(retryRes));
            } catch (err) {
              reject(err);
            }
          },
          reject: (err) => reject(err),
        });
      });
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
