import React, { createContext, useContext, useReducer, ReactNode, useCallback, useRef, useEffect } from 'react';
import { storeReducer, initialStoreState, StoreState } from './storeReducer';
import { useToast } from './ToastContext';
import { useLocale } from '../i18n/LocaleContext';
import { useAuth } from './AuthContext';
import {
  Product,
  Category,
  SubCategory,
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
import { subCategoryService, BackendSubCategory } from '../services/subCategoryService';
import { orderService, BackendOrder } from '../services/orderService';
import { userService, BackendUser } from '../services/userService';
import { couponService, BackendCoupon } from '../services/couponService';
import { settingService } from '../services/settingService';
import { roleService } from '../services/roleService';
import { departmentService, BackendDepartment } from '../services/departmentService';

interface StoreContextValue {
  state: StoreState;
  loading: boolean;
  refresh: () => Promise<void>;
  addProduct: (p: Omit<Product, 'id' | 'sku'>) => Promise<void>;
  editProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  restockProduct: (id: string, amount: number) => void;
  addCategory: (name: string, icon: string, image?: string, slug?: string) => Promise<void>;
  editCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubCategory: (data: Omit<SubCategory, 'id' | 'slug' | 'createdAt'>) => Promise<void>;
  editSubCategory: (id: string, data: Partial<SubCategory>) => Promise<void>;
  deleteSubCategory: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  addReviewReply: (reviewId: string, replyText: string) => void;
  deleteReviewReply: (reviewId: string) => void;
  updateRolePermissions: (roleId: string, permissions: string[]) => Promise<void>;
  saveSettings: (settings: StoreSettings) => void;
  clearLogs: () => void;
  addCustomer: (c: Omit<Customer, 'id' | 'recentOrders' | 'contactLog'> & { password?: string }) => Promise<void>;
  editCustomer: (c: Customer) => Promise<void>;
  addCoupon: (c: Omit<Coupon, 'id'>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
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
      const [categories, subCategories, products, orders, users, coupons, departments] = await Promise.allSettled([
        categoryService.list(),
        subCategoryService.list(),
        productService.list(),
        orderService.list(),
        userService.list(),
        couponService.list(),
        departmentService.list(),
      ]);

      const newState: Partial<StoreState> = {};

      if (categories.status === 'fulfilled') {
        newState.categories = categories.value.map(mapBackendCategory);
      }
      if (subCategories.status === 'fulfilled') {
        newState.subCategories = subCategories.value.map((sc) => ({
          id: sc.id,
          categoryId: sc.categoryId,
          name: sc.name,
          slug: sc.slug,
          description: sc.description,
          image: sc.image,
          sortOrder: sc.sortOrder,
          isActive: sc.isActive,
          categoryName: sc.categoryName || '',
          productCount: sc.productCount || 0,
          createdAt: sc.createdAt,
        }));
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
      if (departments.status === 'fulfilled') {
        newState.departments = departments.value.data.map((bd: BackendDepartment) => ({
          id: bd.id,
          name: bd.name,
          nameAr: bd.nameAr,
          description: bd.description || '',
          adminIds: bd.adminIds || [],
          productCount: bd.productCount || 0,
          orderCount: bd.orderCount || 0,
          revenue: bd.revenue || 0,
          createdAt: bd.createdAt || '',
        }));
      }

      try {
        const settings = await settingService.list();
        const storeNameSetting = settings.find((s) => s.key === 'store_name' || s.key === 'site_name');
        if (storeNameSetting) {
          newState.storeSettings = {
            storeName: storeNameSetting.value?.toString() || '',
            storeDesc: '',
            phone: '',
            city: '',
            address: '',
            logoUrl: '',
            maintenanceMode: false,
          };
        }
      } catch { /* keep defaults */ }

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
      // API unavailable — state stays empty until next refresh
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, fetchData]);

  // ─── Backend-first CRUD operations ──────────────────────────────────────

  const addProduct = useCallback(async (p: Omit<Product, 'id' | 'sku'>) => {
    try {
      const response = await productService.create(p as any);
      const product = mapBackendProduct(response.data);
      dispatch({ type: 'ADD_PRODUCT', payload: product });
      showToast(tRef.current('تمت إضافة المنتج الجديد بنجاح'));
    } catch {
      showToast(tRef.current('فشل إضافة المنتج'), 'error');
      throw new Error('Failed to add product');
    }
  }, [showToast]);

  const editProduct = useCallback(async (p: Product) => {
    try {
      const response = await productService.update(p.id, p as any);
      const product = mapBackendProduct(response.data);
      dispatch({ type: 'EDIT_PRODUCT', payload: product });
      showToast(tRef.current('تم تحديث بيانات المنتج'));
    } catch {
      showToast(tRef.current('فشل تحديث المنتج'), 'error');
      throw new Error('Failed to update product');
    }
  }, [showToast]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await productService.remove(id);
      dispatch({ type: 'DELETE_PRODUCT', payload: { id } });
      showToast(tRef.current('تم حذف المنتج بنجاح'), 'error');
    } catch {
      showToast(tRef.current('فشل حذف المنتج'), 'error');
      throw new Error('Failed to delete product');
    }
  }, [showToast]);

  const restockProduct = useCallback((id: string, amount: number) => {
    dispatch({ type: 'RESTOCK_PRODUCT', payload: { id, amount } });
    showToast(`${tRef.current('تمت إضافة')} ${amount} ${tRef.current('قطعة')} ${tRef.current('للمخزون')}`);
  }, [showToast]);

  const addCategory = useCallback(async (name: string, icon: string, image?: string, slug?: string) => {
    try {
      const backendCategory = await categoryService.create({ name, image, slug });
      const category = mapBackendCategory(backendCategory);
      dispatch({ type: 'ADD_CATEGORY', payload: category });
      showToast(tRef.current('تمت إضافة الفئة الجديدة'));
    } catch {
      showToast(tRef.current('فشل إضافة الفئة'), 'error');
      throw new Error('Failed to add category');
    }
  }, [showToast]);

  const editCategory = useCallback(async (id: string, data: Partial<Category>) => {
    try {
      const backendCategory = await categoryService.update(id, data);
      const category: Category = {
        id: backendCategory.id,
        name: backendCategory.name,
        icon: backendCategory.icon || 'Tag',
        productCount: backendCategory.productCount ?? 0,
        image: backendCategory.image,
        description: backendCategory.description,
        slug: backendCategory.slug,
        sortOrder: backendCategory.sort_order,
        isActive: backendCategory.is_active,
      };
      dispatch({ type: 'EDIT_CATEGORY', payload: category });
      showToast(tRef.current('تم تحديث الفئة بنجاح'));
    } catch {
      showToast(tRef.current('فشل تحديث الفئة'), 'error');
      throw new Error('Failed to update category');
    }
  }, [showToast]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await categoryService.remove(id);
      dispatch({ type: 'DELETE_CATEGORY', payload: { id } });
      showToast(tRef.current('تم حذف الفئة بنجاح'), 'error');
    } catch {
      showToast(tRef.current('فشل حذف الفئة'), 'error');
      throw new Error('Failed to delete category');
    }
  }, [showToast]);

  const addSubCategory = useCallback(async (data: Omit<SubCategory, 'id' | 'slug' | 'createdAt'> & { slug?: string }) => {
    try {
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const backendSubCategory = await subCategoryService.create({
        categoryId: data.categoryId,
        name: data.name,
        slug: slug,
        description: data.description,
        image: data.image,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive,
      });
      const subCategory: SubCategory = {
        id: backendSubCategory.id,
        categoryId: backendSubCategory.categoryId,
        name: backendSubCategory.name,
        slug: backendSubCategory.slug,
        description: backendSubCategory.description,
        image: backendSubCategory.image,
        sortOrder: backendSubCategory.sortOrder,
        isActive: backendSubCategory.isActive,
        categoryName: backendSubCategory.categoryName || '',
        productCount: backendSubCategory.productCount || 0,
        createdAt: backendSubCategory.createdAt,
      };
      dispatch({ type: 'ADD_SUBCATEGORY', payload: subCategory });
      showToast(tRef.current('تمت إضافة التصنيف الفرعي الجديد'));
    } catch {
      showToast(tRef.current('فشل إضافة التصنيف الفرعي'), 'error');
      throw new Error('Failed to add sub-category');
    }
  }, [showToast]);

  const editSubCategory = useCallback(async (id: string, data: Partial<SubCategory>) => {
    try {
      const backendSubCategory = await subCategoryService.update(id, {
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      });
      const subCategory: SubCategory = {
        id: backendSubCategory.id,
        categoryId: backendSubCategory.categoryId,
        name: backendSubCategory.name,
        slug: backendSubCategory.slug,
        description: backendSubCategory.description,
        image: backendSubCategory.image,
        sortOrder: backendSubCategory.sortOrder,
        isActive: backendSubCategory.isActive,
        categoryName: backendSubCategory.categoryName || '',
        productCount: backendSubCategory.productCount || 0,
        createdAt: backendSubCategory.createdAt,
      };
      dispatch({ type: 'EDIT_SUBCATEGORY', payload: subCategory });
      showToast(tRef.current('تم تحديث التصنيف الفرعي بنجاح'));
    } catch {
      showToast(tRef.current('فشل تحديث التصنيف الفرعي'), 'error');
      throw new Error('Failed to update sub-category');
    }
  }, [showToast]);

  const deleteSubCategory = useCallback(async (id: string) => {
    try {
      await subCategoryService.remove(id);
      dispatch({ type: 'DELETE_SUBCATEGORY', payload: { id } });
      showToast(tRef.current('تم حذف التصنيف الفرعي بنجاح'), 'error');
    } catch {
      showToast(tRef.current('فشل حذف التصنيف الفرعي'), 'error');
      throw new Error('Failed to delete sub-category');
    }
  }, [showToast]);

  const updateOrderStatus = useCallback(async (id: string, status: string) => {
    try {
      await orderService.update(id, { status: status.toUpperCase() });
      dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id, status } });
      showToast(`${tRef.current('تم تحديث حالة الطلب إلى')} ${status}`);
    } catch {
      showToast(tRef.current('فشل تحديث حالة الطلب'), 'error');
      throw new Error('Failed to update order status');
    }
  }, [showToast]);

  const addReviewReply = useCallback((reviewId: string, replyText: string) => {
    dispatch({ type: 'ADD_REVIEW_REPLY', payload: { reviewId, replyText } });
    showToast(tRef.current('تم إرسال رد الإدارة بنجاح'));
  }, [showToast]);

  const deleteReviewReply = useCallback((reviewId: string) => {
    dispatch({ type: 'DELETE_REVIEW_REPLY', payload: { reviewId } });
    showToast(tRef.current('تم حذف الرد'), 'info');
  }, [showToast]);

  const updateRolePermissions = useCallback(async (roleId: string, permissions: string[]) => {
    try {
      await roleService.update(roleId, { permissions } as any);
      dispatch({ type: 'UPDATE_ROLE_PERMISSIONS', payload: { roleId, permissions } });
      showToast(tRef.current('تم تحديث صلاحيات المشرف'));
    } catch {
      showToast(tRef.current('فشل تحديث الصلاحيات'), 'error');
      throw new Error('Failed to update role permissions');
    }
  }, [showToast]);

  const saveSettings = useCallback((settings: StoreSettings) => {
    dispatch({ type: 'SAVE_SETTINGS', payload: settings });
    showToast(tRef.current('تم حفظ الإعدادات بنجاح'));
  }, [showToast]);

  const clearLogs = useCallback(() => {
    dispatch({ type: 'CLEAR_LOGS' });
    showToast(tRef.current('تم تفريغ السجل بالكامل'), 'info');
  }, [showToast]);

  const addCustomer = useCallback(async (c: Omit<Customer, 'id' | 'recentOrders' | 'contactLog'> & { password?: string }) => {
    try {
      const backendUser = await userService.create({
        email: c.email,
        phone: c.phone,
        first_name: c.name,
        password: c.password,
      } as any);
      const customer = mapBackendUser(backendUser);
      dispatch({ type: 'ADD_CUSTOMER', payload: customer });
      showToast(tRef.current('تمت إضافة العميل بنجاح'));
    } catch {
      showToast(tRef.current('فشل إضافة العميل'), 'error');
      throw new Error('Failed to add customer');
    }
  }, [showToast]);

  const editCustomer = useCallback(async (c: Customer) => {
    try {
      const backendUser = await userService.update(c.id, {
        email: c.email,
        phone: c.phone,
        first_name: c.name,
      } as any);
      const customer = mapBackendUser(backendUser);
      dispatch({ type: 'EDIT_CUSTOMER', payload: customer });
      showToast(tRef.current('تم تحديث ملف العميل بنجاح'));
    } catch {
      showToast(tRef.current('فشل تحديث العميل'), 'error');
      throw new Error('Failed to update customer');
    }
  }, [showToast]);

  const addCoupon = useCallback(async (c: Omit<Coupon, 'id'>) => {
    try {
      // Parse discount string to extract value and determine type
      let value = 0;
      let type = 'PERCENTAGE';
      if (c.discount) {
        const percentMatch = c.discount.match(/(\d+(?:\.\d+)?)\s*%/);
        const fixedMatch = c.discount.match(/(\d+(?:\.\d+)?)/);
        if (percentMatch) {
          value = parseFloat(percentMatch[1]);
          type = 'PERCENTAGE';
        } else if (fixedMatch) {
          value = parseFloat(fixedMatch[1]);
          type = 'FIXED';
        }
      }
      const backendCoupon = await couponService.create({
        name: c.code, // Use coupon code as the name since frontend doesn't have a separate name field
        code: c.code,
        type,
        value,
        description: c.description,
        start_date: c.status === 'scheduled' ? new Date().toISOString() : undefined,
        end_date: c.expiry && c.expiry !== 'بدون تاريخ انتهاء' ? new Date(c.expiry).toISOString() : undefined,
      });
      const coupon = mapBackendCoupon(backendCoupon);
      dispatch({ type: 'ADD_COUPON', payload: coupon });
      showToast(tRef.current('تم إطلاق كوبون الخصم الجديد بنجاح'));
    } catch {
      showToast(tRef.current('فشل إضافة الكوبون'), 'error');
      throw new Error('Failed to add coupon');
    }
  }, [showToast]);

  const deleteCoupon = useCallback(async (id: string) => {
    try {
      await couponService.remove(id);
      dispatch({ type: 'DELETE_COUPON', payload: { id } });
      showToast(tRef.current('تم إلغاء الكوبون'), 'error');
    } catch {
      showToast(tRef.current('فشل حذف الكوبون'), 'error');
      throw new Error('Failed to delete coupon');
    }
  }, [showToast]);

  // ─── Local-only operations (no backend API yet) ─────────────────────────

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

  const addDepartment = useCallback(async (name: string, nameAr: string, description: string) => {
    try {
      const backendDept = await departmentService.create({ name, nameAr, description });
      const dept: Department = {
        id: backendDept.id,
        name: backendDept.name,
        nameAr: backendDept.nameAr,
        description: backendDept.description || '',
        adminIds: backendDept.adminIds || [],
        productCount: backendDept.productCount || 0,
        orderCount: backendDept.orderCount || 0,
        revenue: backendDept.revenue || 0,
        createdAt: backendDept.createdAt || new Date().toISOString(),
      };
      dispatch({ type: 'ADD_DEPARTMENT', payload: dept });
      showToast(tRef.current('تم إنشاء القسم الجديد'));
    } catch {
      showToast(tRef.current('فشل إنشاء القسم'), 'error');
      throw new Error('Failed to add department');
    }
  }, [showToast]);

  const editDepartment = useCallback(async (d: Department) => {
    try {
      const backendDept = await departmentService.update(d.id, d);
      const updatedDept: Department = {
        id: backendDept.id,
        name: backendDept.name,
        nameAr: backendDept.nameAr,
        description: backendDept.description || '',
        adminIds: backendDept.adminIds || [],
        productCount: backendDept.productCount || 0,
        orderCount: backendDept.orderCount || 0,
        revenue: backendDept.revenue || 0,
        createdAt: backendDept.createdAt || d.createdAt,
      };
      dispatch({ type: 'EDIT_DEPARTMENT', payload: updatedDept });
      showToast(tRef.current('تم تحديث القسم'));
    } catch {
      showToast(tRef.current('فشل تحديث القسم'), 'error');
      throw new Error('Failed to update department');
    }
  }, [showToast]);

  const deleteDepartment = useCallback(async (id: string) => {
    try {
      await departmentService.remove(id);
      dispatch({ type: 'DELETE_DEPARTMENT', payload: { id } });
      showToast(tRef.current('تم حذف القسم'), 'error');
    } catch {
      showToast(tRef.current('فشل حذف القسم'), 'error');
      throw new Error('Failed to delete department');
    }
  }, [showToast]);

  const addDepartmentAdmin = useCallback(async (a: Omit<AdminUser, 'id'>) => {
    try {
      dispatch({ type: 'ADD_DEPARTMENT_ADMIN', payload: a });
      showToast(tRef.current('تم إضافة مشرف القسم الجديد'));
    } catch {
      showToast(tRef.current('فشل إضافة المشرف'), 'error');
      throw new Error('Failed to add department admin');
    }
  }, [showToast]);

  const editDepartmentAdmin = useCallback(async (a: AdminUser) => {
    try {
      dispatch({ type: 'EDIT_DEPARTMENT_ADMIN', payload: a });
      showToast(tRef.current('تم تحديث بيانات المشرف'));
    } catch {
      showToast(tRef.current('فشل تحديث المشرف'), 'error');
      throw new Error('Failed to update department admin');
    }
  }, [showToast]);

  const deleteDepartmentAdmin = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'DELETE_DEPARTMENT_ADMIN', payload: { id } });
      showToast(tRef.current('تم حذف المشرف'), 'error');
    } catch {
      showToast(tRef.current('فشل حذف المشرف'), 'error');
      throw new Error('Failed to delete department admin');
    }
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
    editCategory,
    deleteCategory,
    addSubCategory,
    editSubCategory,
    deleteSubCategory,
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
