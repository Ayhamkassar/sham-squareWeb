import { getJson } from './apiClient';

export interface BackendBanner {
  id: string;
  title?: string;
  subtitle?: string;
  image?: string;
  link_type?: string;
  link_value?: string;
  platform?: string;
  position?: string;
  sort_order?: number;
  is_active: boolean;
}

export const bannerService = {
  async list(): Promise<BackendBanner[]> {
    const payload = await getJson<{ success: boolean; data: BackendBanner[] }>('/banners');
    return payload?.data ?? [];
  },
};
