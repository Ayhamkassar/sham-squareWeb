import { getJson, putJson } from './apiClient';

export interface BackendRole {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  permissions?: string[];
  is_system_role?: boolean;
  is_active?: boolean;
}

export const roleService = {
  async list(): Promise<BackendRole[]> {
    const payload = await getJson<{ success: boolean; data: BackendRole[] }>('/roles');
    return payload?.data ?? [];
  },

  async update(id: string, data: Partial<BackendRole>): Promise<BackendRole> {
    const payload = await putJson<{ success: boolean; data: BackendRole }>(`/roles/${id}`, data);
    return payload.data;
  },
};
