import { getJson, postJson, putJson, deleteJson } from './apiClient';

export interface BackendDepartment {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  adminIds: string[];
  productCount: number;
  orderCount: number;
  revenue: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const departmentService = {
  async list(params?: { search?: string; page?: number; limit?: number }): Promise<{ data: BackendDepartment[]; pagination: any }> {
    const searchParams = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    const payload = await getJson<{ success: boolean; data: { data: BackendDepartment[]; pagination: any } }>(`/departments${searchParams}`);
    return payload?.data ?? { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  },

  async getById(id: string): Promise<BackendDepartment | null> {
    const payload = await getJson<{ success: boolean; data: BackendDepartment }>(`/departments/${id}`);
    return payload?.data ?? null;
  },

  async create(data: Partial<BackendDepartment>): Promise<BackendDepartment> {
    const payload = await postJson<{ success: boolean; data: BackendDepartment }>('/departments', data);
    return payload.data;
  },

  async update(id: string, data: Partial<BackendDepartment>): Promise<BackendDepartment> {
    const payload = await putJson<{ success: boolean; data: BackendDepartment }>(`/departments/${id}`, data);
    return payload.data;
  },

  async remove(id: string): Promise<void> {
    await deleteJson(`/departments/${id}`);
  },
};