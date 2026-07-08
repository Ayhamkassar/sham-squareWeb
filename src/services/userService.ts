import { getJson, postJson, putJson, deleteJson } from './apiClient';

export interface BackendUser {
  id: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  status?: string;
  role_id?: string;
  created_at?: string;
}

export const userService = {
  async list(params?: Record<string, string>): Promise<BackendUser[]> {
    const searchParams = params ? '?' + new URLSearchParams(params).toString() : '';
    const payload = await getJson<{ success: boolean; data: BackendUser[] }>(`/users${searchParams}`);
    return payload?.data ?? [];
  },

  async getById(id: string): Promise<BackendUser | null> {
    const payload = await getJson<{ success: boolean; data: BackendUser }>(`/users/${id}`);
    return payload?.data ?? null;
  },

  async create(data: Partial<BackendUser>): Promise<BackendUser> {
    const payload = await postJson<{ success: boolean; data: BackendUser }>('/users', data);
    return payload.data;
  },

  async update(id: string, data: Partial<BackendUser>): Promise<BackendUser> {
    const payload = await putJson<{ success: boolean; data: BackendUser }>(`/users/${id}`, data);
    return payload.data;
  },

  async remove(id: string): Promise<void> {
    await deleteJson(`/users/${id}`);
  },
};
