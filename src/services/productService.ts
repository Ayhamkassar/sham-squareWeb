import { getJson, postJson, putJson, deleteJson } from './apiClient';

export interface BackendProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  tags: string[];
  attributes?: {
  price?: number;
};
vendor_id?: string;
  images: string[];
  thumbnail?: string;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  categoryId: string;
  subCategoryId: string;
  status: string;
  isFeatured: boolean;
  rating: any;
  totalSold: number;
}

export const productService = {
  async list(params?: Record<string, any>): Promise<{ data: BackendProduct[] }> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return await getJson<{ data: BackendProduct[] }>(`/products${query}`);
  },

  async getById(id: string): Promise<{ data: BackendProduct }> {
    return await getJson<{ data: BackendProduct }>(`/products/${id}`);
  },

  async create(data: Partial<BackendProduct>): Promise<{ data: BackendProduct }> {
    return await postJson<{ data: BackendProduct }>('/products', data);
  },

  async update(id: string, data: Partial<BackendProduct>): Promise<{ data: BackendProduct }> {
    return await putJson<{ data: BackendProduct }>(`/products/${id}`, data);
  },

  async remove(id: string): Promise<void> {
    await deleteJson(`/products/${id}`);
  },
};
