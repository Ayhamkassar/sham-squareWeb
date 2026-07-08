import { getJson, postJson, deleteJson } from './apiClient';

export interface BackendCoupon {
  id: string;
  code: string;
  name?: string;
  description?: string;
  type?: string;
  value?: number;
  max_discount?: number;
  min_order_amount?: number;
  usage_limit?: number;
  usage_count?: number;
  per_user_limit?: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

export const couponService = {
  async list(): Promise<BackendCoupon[]> {
    const payload = await getJson<{ success: boolean; data: BackendCoupon[] }>('/coupons');
    return payload?.data ?? [];
  },

  async create(data: Partial<BackendCoupon>): Promise<BackendCoupon> {
    const payload = await postJson<{ success: boolean; data: BackendCoupon }>('/coupons', data);
    return payload.data;
  },

  async remove(id: string): Promise<void> {
    await deleteJson(`/coupons/${id}`);
  },
};
