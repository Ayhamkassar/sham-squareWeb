import { BadgeTone } from '../components/ui/Badge';

export type OrderStatusKey = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'refunded';

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  processing: 'قيد المعالجة',
  shipped: 'تم الشحن',
  out_for_delivery: 'خرج للتوصيل',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
  returned: 'مرتجع',
  refunded: 'مسترجع',
};

export const ORDER_STATUS_TONE: Record<string, BadgeTone> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  out_for_delivery: 'info',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'danger',
  refunded: 'neutral',
};

export const ORDER_STATUS_FLOW: string[] = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'];
