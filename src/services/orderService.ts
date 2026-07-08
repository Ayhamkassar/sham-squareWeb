import { getJson, postJson, putJson, deleteJson } from './apiClient';

export interface BackendOrder {
  id: string;
  order_number?: string;
  user_id?: string;
  status: string;
  payment?: Record<string, any>;
  shipping_address?: Record<string, any>;
  pricing?: Record<string, any>;
  total?: number;
  subtotal?: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  currency?: string;
  customer_notes?: string;
  coupon_code?: string;
  coupon_id?: string;
  delivery?: Record<string, any>;
  created_at?: string;
  items?: BackendOrderItem[];
}

export interface BackendOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name?: string;
  variant_name?: string;
  thumbnail?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  currency?: string;
  sku?: string;
}

export const orderService = {
  async list(params?: Record<string, string>): Promise<BackendOrder[]> {
    const searchParams = params ? '?' + new URLSearchParams(params).toString() : '';
    const payload = await getJson<{ success: boolean; data: BackendOrder[] }>(`/orders${searchParams}`);
    return payload?.data ?? [];
  },

  async getById(id: string): Promise<BackendOrder | null> {
    const payload = await getJson<{ success: boolean; data: BackendOrder }>(`/orders/${id}`);
    return payload?.data ?? null;
  },

  async create(data: Partial<BackendOrder>): Promise<BackendOrder> {
    const payload = await postJson<{ success: boolean; data: BackendOrder }>('/orders', data);
    return payload.data;
  },

  async update(id: string, data: Partial<BackendOrder>): Promise<BackendOrder> {
    const payload = await putJson<{ success: boolean; data: BackendOrder }>(`/orders/${id}`, data);
    return payload.data;
  },

  async remove(id: string): Promise<void> {
    await deleteJson(`/orders/${id}`);
  },
};
