import { getJson, postJson, putJson, deleteJson } from './apiClient';

export interface BackendSubCategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  categoryName?: string;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const subCategoryService = {
  async list(): Promise<BackendSubCategory[]> {
    const payload = await getJson<{ success: boolean; data: BackendSubCategory[] }>('/subcategories');
    return payload?.data ?? [];
  },

  async getById(id: string): Promise<BackendSubCategory | null> {
    const payload = await getJson<{ success: boolean; data: BackendSubCategory }>(`/subcategories/${id}`);
    return payload?.data ?? null;
  },

  async create(data: Partial<BackendSubCategory>): Promise<BackendSubCategory> {
    const payload = await postJson<{ success: boolean; data: BackendSubCategory }>('/subcategories', data);
    return payload.data;
  },

  async update(id: string, data: Partial<BackendSubCategory>): Promise<BackendSubCategory> {
    const payload = await putJson<{ success: boolean; data: BackendSubCategory }>(`/subcategories/${id}`, data);
    return payload.data;
  },

  async remove(id: string): Promise<void> {
    await deleteJson(`/subcategories/${id}`);
  },
};