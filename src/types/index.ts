export type AdminRoleType = 'super' | 'department';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleType: AdminRoleType;
  departmentId?: string;
  avatar: string;
  phone: string;
  password: string;
  status: 'active' | 'disabled';
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  adminIds: string[];
  productCount: number;
  orderCount: number;
  revenue: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  category: string;
  departmentId: string;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  sku: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  productCount: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  details?: string;
  departmentId?: string;
}

export interface TrackingStep {
  status: string;
  description: string;
  time: string;
  active: boolean;
}

export interface Courier {
  name: string;
  avatar: string;
  rating: string;
  trips: string;
  phone: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  coupon?: string;
  total: number;
  trackingTimeline: TrackingStep[];
  courier?: Courier;
  departmentIds?: string[];
}

export interface Review {
  id: string;
  customerName: string;
  customerAvatar?: string;
  date: string;
  rating: number;
  productName: string;
  productImage: string;
  comment: string;
  storeReply?: string;
}

export interface ActivityLog {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'product' | 'order' | 'customer' | 'system';
  status?: string;
  statusColor?: string;
}

export interface Role {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  usersCount: number;
  permissionsAr: string[];
}

export interface StoreSettings {
  storeName: string;
  storeDesc: string;
  phone: string;
  city: string;
  address: string;
  logoUrl: string;
  maintenanceMode: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'Active' | 'Inactive' | 'Loyal';
  totalOrders: number;
  lifetimeValue: number;
  city: string;
  memberSince: string;
  recentOrders?: {
    id: string;
    date: string;
    status: string;
    value: string;
  }[];
  contactLog?: {
    date: string;
    time: string;
    title: string;
    description: string;
  }[];
}

export interface Transaction {
  id: string;
  customerName: string;
  customerAvatar?: string;
  customerInitials: string;
  date: string;
  time: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
}

export interface Coupon {
  id: string;
  code: string;
  discount: string;
  description: string;
  usage: string;
  usagePercentage: number;
  expiry: string;
  status: 'active' | 'scheduled' | 'expired';
}

export interface StoreNotification {
  id: string;
  type: 'order' | 'inventory' | 'system' | 'shipping';
  title: string;
  description: string;
  time: string;
  unread: boolean;
  actionLabel?: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  customerName: string;
  category: string;
  description: string;
  status: 'Urgent' | 'Open' | 'Resolved';
  lastMessageTime: string;
  timeAgo: string;
}
