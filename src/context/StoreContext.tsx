import React, { createContext, useContext, useReducer, ReactNode, useCallback, useRef, useEffect } from 'react';
import { storeReducer, initialStoreState, StoreState } from './storeReducer';
import { useToast } from './ToastContext';
import { useLocale } from '../i18n/LocaleContext';
import { useAuth } from './AuthContext';
import {
  Product,
  Category,
  Order,
  Customer,
  Coupon,
  StoreSettings,
  SupportTicket,
  Department,
  AdminUser,
} from '../types';
import { productService, BackendProduct } from '../services/productService';
import { categoryService, BackendCategory } from '../services/categoryService';
import { orderService, BackendOrder } from '../services/orderService';
import { userService, BackendUser } from '../services/userService';
import { couponService, BackendCoupon } from '../services/couponService';
import { settingService } from '../services/settingService';
import { roleService } from '../services/roleService';

interface StoreContextValue {
  state: StoreState;
  loading: boolean;
  refresh: () => Promise<void>;
  addProduct: (p: Omit<Product, 'id' | 'sku'>) => void;
  editProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  restockProduct: (id: string, amount: number) => void;
  addCategory: (name: string, icon: string) => void;
  deleteCategory: (id: string) => void;
  updateOrderStatus: (id: string, status: string) => void;
  addReviewReply: (reviewId: string, replyText: string) => void;
  deleteReviewReply: (reviewId: string) => void;
  updateRolePermissions: (roleId: string, permissions: string[]) => void;
  saveSettings: (settings: StoreSettings) => void;
  clearLogs: () => void;
  addCustomer: (c: Omit<Customer, 'id' | 'recentOrders' | 'contactLog'>) => void;
  editCustomer: (c: Customer) => void;
  addCoupon: (c: Coupon) => void;
  deleteCoupon: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  markNotificationRead: (id: string) => void;
  addSupportTicket: (t: Omit<SupportTicket, 'id' | 'timeAgo'>) => void;
  updateTicketStatus: (id: string, status: SupportTicket['status']) => void;
  addTicketReply: (id: string, replyText: string) => void;
  addDepartment: (name: string, nameAr: string, description: string) => void;
  editDepartment: (d: Department) => void;
  deleteDepartment: (id: string) => void;
  addDepartmentAdmin: (a: Omit<AdminUser, 'id'>) => void;
  editDepartmentAdmin: (a: AdminUser) => void;
  deleteDepartmentAdmin: (id: string) => void;
  toggleDepartmentAdminStatus: (id: string) => void;
  departmentAdmins: AdminUser[];
}

function mapBackendCategory(bc: BackendCategory): Category {
  return {
    id: bc.id,
    name: bc.name,
    icon: bc.icon || 'Tag',
    productCount: bc.productCount ?? 0,
  };
}

function mapBackendProduct(bp: BackendProduct): Product {
  return {
    id: bp.id,
    name: bp.name || '',
    description: bp.description || '',
    price: bp.priceRange?.min ?? bp.attributes?.price ?? 0,
    stock: 0,
    category: bp.categoryId || '',
    departmentId: bp.vendor_id || '',
    image: (bp.images && bp.images[0]) || bp.thumbnail || '',
    isAvailable: bp.status === 'PUBLISHED',
    isFeatured: bp.isFeatured || false,
    sku: bp.slug || bp.id,
  };
}

function mapBackendOrder(bo: BackendOrder): Order {
  return {
    id: bo.id,
    customerName: bo.shipping_address?.fullName || (bo as any).user_id || '',
    customerPhone: bo.shipping_address?.phone || '',
    customerAddress: bo.shipping_address ? `${bo.shipping_address.addressLine1 || ''}, ${bo.shipping_address.city || ''}` : '',
    status: bo.status?.toLowerCase() || 'pending',
    date: bo.created_at || '',
    items: (bo.items || []).map((i) => ({
      productId: i.product_id,
      productName: i.product_name || '',
      productImage: i.thumbnail || '',
      price: i.unit_price || 0,
      quantity: i.quantity || 1,
    })),
    subtotal: bo.pricing?.subtotal ?? bo.subtotal ?? 0,
    shipping: bo.pricing?.shipping ?? bo.shipping ?? 0,
    discount: bo.pricing?.discount ?? bo.discount ?? 0,
    total: bo.pricing?.total ?? bo.total ?? 0,
    trackingTimeline: [],
  };
}

function mapBackendUser(bu: BackendUser): Customer {
  return {
    id: bu.id,
    name: `${bu.first_name || ''} ${bu.last_name || ''}`.trim() || bu.email || '',
    email: bu.email || '',
    phone: bu.phone || '',
    status: (bu.status === 'ACTIVE' ? 'Active' : bu.status === 'INACTIVE' ? 'Inactive' : 'Loyal') as Customer['status'],
    totalOrders: 0,
    lifetimeValue: 0,
    city: '',
    memberSince: bu.created_at?.slice(0, 7).replace('-', ' ') || '',
  };
}

function mapBackendCoupon(bc: BackendCoupon): Coupon {
  const now = new Date();
  const start = bc.start_date ? new Date(bc.start_date) : null;
  const end = bc.end_date ? new Date(bc.end_date) : null;
  let status: Coupon['status'] = 'active';
  if (end && end < now) status = 'expired';
  else if (start && start > now) status = 'scheduled';

  return {
    id: bc.id,
    code: bc.code,
    discount: bc.value ? `${bc.type === 'PERCENTAGE' ? bc.value + '%' : bc.value.toLocaleString() + ' ر.س'}` : '',
    description: bc.description || '',
    usage: `${bc.usage_count || 0} / ${bc.usage_limit || '∞'}`,
    usagePercentage: bc.usage_limit ? Math.round(((bc.usage_count || 0) / bc.usage_limit) * 100) : 0,
    expiry: end ? end.toLocaleDateString('ar-SA') : 'بدون تاريخ انتهاء',
    status,
  };
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialStoreState);
  const [loading, setLoading] = React.useState(true);
  const { showToast } = useToast();
  const { t } = useLocale();
  const { isLoggedIn } = useAuth();
  const tRef = useRef(t);
  tRef.current = t;
  const isLoggedInRef = useRef(isLoggedIn);
  isLoggedInRef.current = isLoggedIn;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [categories, products, orders, users, coupons] = await Promise.allSettled([
        categoryService.list(),
        productService.list(),
        orderService.list(),
        userService.list(),
        couponService.list(),
      ]);

      const newState: Partial<StoreState> = {};

      if (categories.status === 'fulfilled') {
        newState.categories = categories.value.map(mapBackendCategory);
      }
      if (products.status === 'fulfilled') {
        newState.products = products.value.data.map(mapBackendProduct);
      }
      if (orders.status === 'fulfilled') {
        newState.orders = orders.value.map(mapBackendOrder);
      }
      if (users.status === 'fulfilled') {
        newState.customers = users.value.map(mapBackendUser);
      }
      if (coupons.status === 'fulfilled') {
        newState.coupons = coupons.value.map(mapBackendCoupon);
      }

      // Fetch settings
      try {
        const settings = await settingService.list();
        const storeNameSetting = settings.find((s) => s.key === 'store_name' || s.key === 'site_name');
        if (storeNameSetting) {
          newState.storeSettings = {
            ...initialStoreState.storeSettings,
            storeName: storeNameSetting.value?.toString() || initialStoreState.storeSettings.storeName,
          };
        }
      } catch { /* keep defaults */ }

      // Fetch roles
      try {
        const roles = await roleService.list();
        newState.roles = roles.map((r, idx) => ({
          id: r.id,
          name: r.name,
          nameAr: r.display_name || r.name,
          description: r.description || '',
          usersCount: 0,
          permissionsAr: Array.isArray(r.permissions) ? r.permissions : [],
        }));
      } catch { /* keep defaults */ }

      dispatch({ type: 'SET_STATE', payload: newState });
    } catch {
      // Keep mock data as fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, fetchData]);

  // Each action dispatches the domain event, then reports a user-facing toast.
  const addProduct = useCallback((p: Omit<Product, 'id' | 'sku'>) => {
    dispatch({ type: 'ADD_PRODUCT', payload: p });
    productService.create(p).catch(() => {});
    showToast(tRef.current('تمت إضافة المنتج الجديد بنجاح'));
  }, [showToast]);

  const editProduct = useCallback((p: Product) => {
    dispatch({ type: 'EDIT_PRODUCT', payload: p });
    productService.update(p.id, p as any).catch(() => {});
    showToast(tRef.current('تم تحديث بيانات المنتج'));
  }, [showToast]);

  const deleteProduct = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: { id } });
    productService.remove(id).catch(() => {});
    showToast(tRef.current('تم حذف المنتج بنجاح'), 'error');
  }, [showToast]);

  const restockProduct = useCallback((id: string, amount: number) => {
    dispatch({ type: 'RESTOCK_PRODUCT', payload: { id, amount } });
    showToast(`${tRef.current('تمت إضافة')} ${amount} ${tRef.current('قطعة')} ${tRef.current('للمخزون')}`);
  }, [showToast]);

  const addCategory = useCallback((name: string, icon: string) => {
    dispatch({ type: 'ADD_CATEGORY', payload: { name, icon } });
    categoryService.create({ name }).catch(() => {});
    showToast(tRef.current('تمت إضافة الفئة الجديدة'));
  }, [showToast]);

  const deleteCategory = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: { id } });
    categoryService.remove(id).catch(() => {});
    showToast(tRef.current('تم حذف الفئة بنجاح'), 'error');
  }, [showToast]);

  const updateOrderStatus = useCallback((id: string, status: string) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id, status } });
    orderService.update(id, { status: status.toUpperCase() }).catch(() => {});
    showToast(`${tRef.current('تم تحديث حالة الطلب إلى')} ${status}`);
  }, [showToast]);

  const addReviewReply = useCallback((reviewId: string, replyText: string) => {
    dispatch({ type: 'ADD_REVIEW_REPLY', payload: { reviewId, replyText } });
    showToast(tRef.current('تم إرسال رد الإدارة بنجاح'));
  }, [showToast]);

  const deleteReviewReply = useCallback((reviewId: string) => {
    dispatch({ type: 'DELETE_REVIEW_REPLY', payload: { reviewId } });
    showToast(tRef.current('تم حذف الرد'), 'info');
  }, [showToast]);

  const updateRolePermissions = useCallback((roleId: string, permissions: string[]) => {
    dispatch({ type: 'UPDATE_ROLE_PERMISSIONS', payload: { roleId, permissions } });
    roleService.update(roleId, { permissions } as any).catch(() => {});
    showToast(tRef.current('تم تحديث صلاحيات المشرف'));
  }, [showToast]);

  const saveSettings = useCallback((settings: StoreSettings) => {
    dispatch({ type: 'SAVE_SETTINGS', payload: settings });
    showToast(tRef.current('تم حفظ الإعدادات بنجاح'));
  }, [showToast]);

  const clearLogs = useCallback(() => {
    dispatch({ type: 'CLEAR_LOGS' });
    showToast(tRef.current('تم تفريغ السجل بالكامل'), 'info');
  }, [showToast]);

  const addCustomer = useCallback((c: Omit<Customer, 'id' | 'recentOrders' | 'contactLog'>) => {
    dispatch({ type: 'ADD_CUSTOMER', payload: c });
    userService.create({
      email: c.email,
      phone: c.phone,
      first_name: c.name,
    } as any).catch(() => {});
    showToast(tRef.current('تمت إضافة العميل بنجاح'));
  }, [showToast]);

  const editCustomer = useCallback((c: Customer) => {
    dispatch({ type: 'EDIT_CUSTOMER', payload: c });
    userService.update(c.id, {
      email: c.email,
      phone: c.phone,
      first_name: c.name,
    } as any).catch(() => {});
    showToast(tRef.current('تم تحديث ملف العميل بنجاح'));
  }, [showToast]);

  const addCoupon = useCallback((c: Coupon) => {
    dispatch({ type: 'ADD_COUPON', payload: c });
    couponService.create({
      code: c.code,
      description: c.description,
    }).catch(() => {});
    showToast(tRef.current('تم إطلاق كوبون الخصم الجديد بنجاح'));
  }, [showToast]);

  const deleteCoupon = useCallback((id: string) => {
    dispatch({ type: 'DELETE_COUPON', payload: { id } });
    couponService.remove(id).catch(() => {});
    showToast(tRef.current('تم إلغاء الكوبون'), 'error');
  }, [showToast]);

  const markAllNotificationsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
    showToast(tRef.current('تم تحديد جميع التنبيهات كمقروءة'));
  }, [showToast]);

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
    showToast(tRef.current('تم إفراغ مركز الإشعارات بالكامل'), 'info');
  }, [showToast]);

  const markNotificationRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: { id } });
  }, []);

  const addSupportTicket = useCallback((t: Omit<SupportTicket, 'id' | 'timeAgo'>) => {
    dispatch({ type: 'ADD_SUPPORT_TICKET', payload: t });
    showToast(tRef.current('تم فتح التذكرة بنجاح'));
  }, [showToast]);

  const updateTicketStatus = useCallback((id: string, status: SupportTicket['status']) => {
    dispatch({ type: 'UPDATE_TICKET_STATUS', payload: { id, status } });
    showToast(`${tRef.current('تم تحديث التذكرة إلى')} ${status}`);
  }, [showToast]);

  const addTicketReply = useCallback((id: string, replyText: string) => {
    dispatch({ type: 'ADD_TICKET_REPLY', payload: { id, replyText } });
    showToast(tRef.current('تم تسجيل الرد بنجاح'));
  }, [showToast]);

  const addDepartment = useCallback((name: string, nameAr: string, description: string) => {
    dispatch({ type: 'ADD_DEPARTMENT', payload: { name, nameAr, description } });
    showToast(tRef.current('تم إنشاء القسم الجديد'));
  }, [showToast]);

  const editDepartment = useCallback((d: Department) => {
    dispatch({ type: 'EDIT_DEPARTMENT', payload: d });
    showToast(tRef.current('تم تحديث القسم'));
  }, [showToast]);

  const deleteDepartment = useCallback((id: string) => {
    dispatch({ type: 'DELETE_DEPARTMENT', payload: { id } });
    showToast(tRef.current('تم حذف القسم'), 'error');
  }, [showToast]);

  const addDepartmentAdmin = useCallback((a: Omit<AdminUser, 'id'>) => {
    dispatch({ type: 'ADD_DEPARTMENT_ADMIN', payload: a });
    showToast(tRef.current('تم إضافة مشرف القسم الجديد'));
  }, [showToast]);

  const editDepartmentAdmin = useCallback((a: AdminUser) => {
    dispatch({ type: 'EDIT_DEPARTMENT_ADMIN', payload: a });
    showToast(tRef.current('تم تحديث بيانات المشرف'));
  }, [showToast]);

  const deleteDepartmentAdmin = useCallback((id: string) => {
    dispatch({ type: 'DELETE_DEPARTMENT_ADMIN', payload: { id } });
    showToast(tRef.current('تم حذف المشرف'), 'error');
  }, [showToast]);

  const toggleDepartmentAdminStatus = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_DEPARTMENT_ADMIN_STATUS', payload: { id } });
  }, []);

  const value: StoreContextValue = {
    state,
    loading,
    refresh: fetchData,
    addProduct,
    editProduct,
    deleteProduct,
    restockProduct,
    addCategory,
    deleteCategory,
    updateOrderStatus,
    addReviewReply,
    deleteReviewReply,
    updateRolePermissions,
    saveSettings,
    clearLogs,
    addCustomer,
    editCustomer,
    addCoupon,
    deleteCoupon,
    markAllNotificationsRead,
    clearAllNotifications,
    markNotificationRead,
    addSupportTicket,
    updateTicketStatus,
    addTicketReply,
    addDepartment,
    editDepartment,
    deleteDepartment,
    addDepartmentAdmin,
    editDepartmentAdmin,
    deleteDepartmentAdmin,
    toggleDepartmentAdminStatus,
    departmentAdmins: state.departmentAdmins,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
