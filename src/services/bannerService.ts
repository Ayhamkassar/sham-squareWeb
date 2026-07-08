import { getJson, postJson, putJson, deleteJson } from './apiClient';

export interface BackendBanner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive: boolean;
  sortOrder: number;
}

export const bannerService = {
  async list(): Promise<{ data: BackendBanner[] }> {
    return await getJson<{ data: BackendBanner[] }>('/banners');
  },

  async getById(id: string): Promise<{ data: BackendBanner }> {
    return await getJson<{ data: BackendBanner }>(`/banners/${id}`);
  },

  async create(data: Partial<BackendBanner>): Promise<{ data: BackendBanner }> {
    return await postJson<{ data: BackendBanner }>('/banners', data);
  },

  async update(id: string, data: Partial<BackendBanner>): Promise<{ data: BackendBanner }> {
    return await putJson<{ data: BackendBanner }>(`/banners/${id}`, data);
  },

  async remove(id: string): Promise<void> {
    await deleteJson(`/banners/${id}`);
  },
};
