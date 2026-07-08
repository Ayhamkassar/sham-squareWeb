import { getJson, putJson } from './apiClient';

export interface BackendSetting {
  id: string;
  key: string;
  value: any;
  group_name?: string;
  description?: string;
  is_public?: boolean;
}

export const settingService = {
  async list(): Promise<BackendSetting[]> {
    const payload = await getJson<{ success: boolean; data: BackendSetting[] }>('/settings');
    return payload?.data ?? [];
  },

  async update(id: string, data: Partial<BackendSetting>): Promise<BackendSetting> {
    const payload = await putJson<{ success: boolean; data: BackendSetting }>(`/settings/${id}`, data);
    return payload.data;
  },
};
