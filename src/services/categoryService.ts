import { getJson, postJson, putJson, deleteJson } from './apiClient';

export interface BackendCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  icon?: string;
  sort_order?: number;
  is_active: boolean;
  productCount?: number;
}

export const categoryService = {
  async list(): Promise<BackendCategory[]> {
    const payload = await getJson<{ success: boolean; data: BackendCategory[] }>('/categories');
    return payload?.data ?? [];
  },

  async getById(id: string): Promise<BackendCategory | null> {
    const payload = await getJson<{ success: boolean; data: BackendCategory }>(`/categories/${id}`);
    return payload?.data ?? null;
  },

  async create(data: Partial<BackendCategory>): Promise<BackendCategory> {
    const payload = await postJson<{ success: boolean; data: BackendCategory }>('/categories', data);
    return payload.data;
  },

  async update(id: string, data: Partial<BackendCategory>): Promise<BackendCategory> {
    const payload = await putJson<{ success: boolean; data: BackendCategory }>(`/categories/${id}`, data);
    return payload.data;
  },

  async remove(id: string): Promise<void> {
    await deleteJson(`/categories/${id}`);
  },
};
