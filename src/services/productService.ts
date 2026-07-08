import { getJson, postJson, putJson, deleteJson } from './apiClient';

export interface BackendProduct {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  short_description?: string;
  brand?: string;
  price?: number;
  images?: string[];
  thumbnail?: string;
  category_id?: string;
  sub_category_id?: string;
  vendor_id?: string;
  status?: string;
  is_featured?: boolean;
  tags?: string[];
  total_sold?: number;
  price_range?: { min?: number; max?: number };
  attributes?: Record<string, any>;
  rating?: { average?: number; count?: number };
}

export const productService = {
  async list(params?: Record<string, string>): Promise<BackendProduct[]> {
    const searchParams = params ? '?' + new URLSearchParams(params).toString() : '';
    const payload = await getJson<{ success: boolean; data: BackendProduct[] }>(`/products${searchParams}`);
    return payload?.data ?? [];
  },

  async getById(id: string): Promise<BackendProduct | null> {
    const payload = await getJson<{ success: boolean; data: BackendProduct }>(`/products/${id}`);
    return payload?.data ?? null;
  },

  async create(data: Partial<BackendProduct>): Promise<BackendProduct> {
    const payload = await postJson<{ success: boolean; data: BackendProduct }>('/products', data);
    return payload.data;
  },

  async update(id: string, data: Partial<BackendProduct>): Promise<BackendProduct> {
    const payload = await putJson<{ success: boolean; data: BackendProduct }>(`/products/${id}`, data);
    return payload.data;
  },

  async remove(id: string): Promise<void> {
    await deleteJson(`/products/${id}`);
  },
};
