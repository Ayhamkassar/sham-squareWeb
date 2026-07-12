import {
  Product,
  Category,
  Order,
  Review,
  Role,
  ActivityLog as LogItem,
  StoreSettings,
  Customer,
  Transaction,
  Coupon,
  StoreNotification,
  SupportTicket,
  Department,
  AdminUser,
} from '../types';

export interface StoreState {
  products: Product[];
  categories: Category[];
  orders: Order[];
  reviews: Review[];
  roles: Role[];
  activityLogs: LogItem[];
  storeSettings: StoreSettings;
  customers: Customer[];
  transactions: Transaction[];
  coupons: Coupon[];
  notifications: StoreNotification[];
  supportTickets: SupportTicket[];
  departments: Department[];
  departmentAdmins: AdminUser[];
}

const defaultSettings: StoreSettings = {
  storeName: '',
  storeDesc: '',
  phone: '',
  city: '',
  address: '',
  logoUrl: '',
  maintenanceMode: false,
};

export const initialStoreState: StoreState = {
  products: [],
  categories: [],
  orders: [],
  reviews: [],
  roles: [],
  activityLogs: [],
  storeSettings: defaultSettings,
  customers: [],
  transactions: [],
  coupons: [],
  notifications: [],
  supportTickets: [],
  departments: [],
  departmentAdmins: [],
};

export type StoreAction =
  | { type: 'SET_STATE'; payload: Partial<StoreState> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_PRODUCT'; payload: Omit<Product, 'id' | 'sku'> }
  | { type: 'EDIT_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: { id: string } }
  | { type: 'RESTOCK_PRODUCT'; payload: { id: string; amount: number } }
  | { type: 'ADD_CATEGORY'; payload: { name: string; icon: string; image?: string } }
  | { type: 'DELETE_CATEGORY'; payload: { id: string } }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { id: string; status: string } }
  | { type: 'ADD_REVIEW_REPLY'; payload: { reviewId: string; replyText: string } }
  | { type: 'DELETE_REVIEW_REPLY'; payload: { reviewId: string } }
  | { type: 'UPDATE_ROLE_PERMISSIONS'; payload: { roleId: string; permissions: string[] } }
  | { type: 'SAVE_SETTINGS'; payload: StoreSettings }
  | { type: 'CLEAR_LOGS' }
  | { type: 'ADD_CUSTOMER'; payload: Omit<Customer, 'id' | 'recentOrders' | 'contactLog'> }
  | { type: 'EDIT_CUSTOMER'; payload: Customer }
  | { type: 'ADD_COUPON'; payload: Coupon }
  | { type: 'DELETE_COUPON'; payload: { id: string } }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'MARK_NOTIFICATION_READ'; payload: { id: string } }
  | { type: 'ADD_SUPPORT_TICKET'; payload: Omit<SupportTicket, 'id' | 'timeAgo'> }
  | { type: 'UPDATE_TICKET_STATUS'; payload: { id: string; status: SupportTicket['status'] } }
  | { type: 'ADD_TICKET_REPLY'; payload: { id: string; replyText: string } }
  | { type: 'ADD_DEPARTMENT'; payload: { name: string; nameAr: string; description: string } }
  | { type: 'EDIT_DEPARTMENT'; payload: Department }
  | { type: 'DELETE_DEPARTMENT'; payload: { id: string } }
  | { type: 'ADD_DEPARTMENT_ADMIN'; payload: Omit<AdminUser, 'id'> }
  | { type: 'EDIT_DEPARTMENT_ADMIN'; payload: AdminUser }
  | { type: 'DELETE_DEPARTMENT_ADMIN'; payload: { id: string } }
  | { type: 'TOGGLE_DEPARTMENT_ADMIN_STATUS'; payload: { id: string } };

/** A log entry is appended to activityLogs alongside almost every mutation. */
function withLog(logs: LogItem[], title: string, description: string, type: LogItem['type'] = 'system'): LogItem[] {
  const entry: LogItem = { id: `LOG-${Date.now()}`, title, description, time: 'الآن', type };
  return [entry, ...logs];
}

export function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };

    case 'SET_LOADING':
      return { ...state } as StoreState;

    case 'ADD_PRODUCT': {
      const sku = `SHM-${Math.floor(1000 + Math.random() * 9000)}`;
      const id = `PROD-${Date.now()}`;
      const product: Product = { ...action.payload, id, sku };
      return {
        ...state,
        products: [product, ...state.products],
        categories: state.categories.map((c) =>
          c.name === product.category ? { ...c, productCount: c.productCount + 1 } : c
        ),
        activityLogs: withLog(state.activityLogs, 'إضافة منتج جديد', `تمت إضافة المنتج الفاخر "${product.name}" إلى الرفوف بنجاح.`, 'product'),
      };
    }

    case 'EDIT_PRODUCT': {
      const updated = action.payload;
      return {
        ...state,
        products: state.products.map((p) => (p.id === updated.id ? updated : p)),
        activityLogs: withLog(state.activityLogs, 'تعديل منتج', `تم تعديل مواصفات المنتج "${updated.name}" وتحديث كمياته.`, 'product'),
      };
    }

    case 'DELETE_PRODUCT': {
      const target = state.products.find((p) => p.id === action.payload.id);
      if (!target) return state;
      return {
        ...state,
        products: state.products.filter((p) => p.id !== target.id),
        categories: state.categories.map((c) =>
          c.name === target.category ? { ...c, productCount: Math.max(0, c.productCount - 1) } : c
        ),
        activityLogs: withLog(state.activityLogs, 'حذف منتج', `تم سحب المنتج "${target.name}" من صالة العرض تماماً.`, 'product'),
      };
    }

    case 'RESTOCK_PRODUCT': {
      const { id, amount } = action.payload;
      const target = state.products.find((p) => p.id === id);
      return {
        ...state,
        products: state.products.map((p) => (p.id === id ? { ...p, stock: p.stock + amount, isAvailable: true } : p)),
        activityLogs: withLog(state.activityLogs, 'إعادة تموين المخزون', `تم تزويد منتج "${target?.name || ''}" بـ +${amount} قطعة إضافية.`, 'product'),
      };
    }

    case 'ADD_CATEGORY': {
      const category: Category = { id: `CAT-${Date.now()}`, name: action.payload.name, icon: action.payload.icon, productCount: 0, image: action.payload.image };
      return {
        ...state,
        categories: [...state.categories, category],
        activityLogs: withLog(state.activityLogs, 'إضافة فئة تصنيف', `تم إطلاق فئة جديدة لترتيب المنتجات باسم "${category.name}".`, 'product'),
      };
    }

    case 'DELETE_CATEGORY': {
      const target = state.categories.find((c) => c.id === action.payload.id);
      if (!target) return state;
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== target.id),
        activityLogs: withLog(state.activityLogs, 'إزالة فئة تصنيف', `تم إلغاء واستبعاد الفئة التنسيقية "${target.name}".`, 'product'),
      };
    }

    case 'UPDATE_ORDER_STATUS': {
      const { id, status } = action.payload;
      const target = state.orders.find((o) => o.id === id);
      const labelMap: Record<string, string> = {
        pending: 'معالجة الطلب',
        confirmed: 'تأكيد الطلب',
        processing: 'معالجة الطلب',
        shipped: 'شحن الطلب',
        delivered: 'تسليم الشحنة',
        cancelled: 'إلغاء الطلب',
        returned: 'إرجاع الطلب',
        refunded: 'استرداد الطلب',
      };
      return {
        ...state,
        orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        activityLogs: withLog(state.activityLogs, labelMap[status] || 'تحديث الطلب', `تم تغيير حالة طلب العميل "${target?.customerName || ''}" إلى [${status}].`, 'order'),
      };
    }

    case 'ADD_REVIEW_REPLY':
      return {
        ...state,
        reviews: state.reviews.map((r) => (r.id === action.payload.reviewId ? { ...r, storeReply: action.payload.replyText } : r)),
        activityLogs: withLog(state.activityLogs, 'الرد على مراجعة', 'قامت إدارة المتجر بالرد رسمياً على تقييم أحد العملاء.', 'customer'),
      };

    case 'DELETE_REVIEW_REPLY':
      return {
        ...state,
        reviews: state.reviews.map((r) => (r.id === action.payload.reviewId ? { ...r, storeReply: undefined } : r)),
        activityLogs: withLog(state.activityLogs, 'حذف رد مراجعة', 'تم حذف الرد الخاص بمراجعة العميل.', 'customer'),
      };

    case 'UPDATE_ROLE_PERMISSIONS': {
      const target = state.roles.find((r) => r.id === action.payload.roleId);
      return {
        ...state,
        roles: state.roles.map((r) => (r.id === action.payload.roleId ? { ...r, permissionsAr: action.payload.permissions } : r)),
        activityLogs: withLog(state.activityLogs, 'تعديل صلاحيات الوصول', `تم تحديث أدوار وصلاحيات المشرف "${target?.nameAr || ''}".`, 'system'),
      };
    }

    case 'SAVE_SETTINGS':
      return {
        ...state,
        storeSettings: action.payload,
        activityLogs: withLog(state.activityLogs, 'تحديث إعدادات المتجر', `تم تحديث التكوين العام لمتجر "${action.payload.storeName}".`, 'system'),
      };

    case 'CLEAR_LOGS':
      return { ...state, activityLogs: [] };

    case 'ADD_CUSTOMER': {
      const customer: Customer = { ...action.payload, id: `CUST-${Date.now()}`, recentOrders: [], contactLog: [] };
      return {
        ...state,
        customers: [customer, ...state.customers],
        activityLogs: withLog(state.activityLogs, 'إضافة عميل جديد', `تم تسجيل العميل "${customer.name}" وتخصيص ملف له بنجاح.`, 'customer'),
      };
    }

    case 'EDIT_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map((c) => (c.id === action.payload.id ? action.payload : c)),
        activityLogs: withLog(state.activityLogs, 'تعديل ملف عميل', `تم تحديث البيانات الأساسية لملف العميل "${action.payload.name}".`, 'customer'),
      };

    case 'ADD_COUPON':
      return {
        ...state,
        coupons: [action.payload, ...state.coupons],
        activityLogs: withLog(state.activityLogs, 'إضافة كوبون خصم', `تم إطلاق كوبون جديد بقيمة "${action.payload.discount}" تحت رمز "${action.payload.code}".`, 'system'),
      };

    case 'DELETE_COUPON': {
      const target = state.coupons.find((c) => c.id === action.payload.id);
      if (!target) return state;
      return {
        ...state,
        coupons: state.coupons.filter((c) => c.id !== target.id),
        activityLogs: withLog(state.activityLogs, 'إلغاء كوبون خصم', `تم تعطيل وإلغاء صلاحية كود الخصم "${target.code}".`, 'system'),
      };
    }

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, unread: false })) };

    case 'CLEAR_ALL_NOTIFICATIONS':
      return { ...state, notifications: [] };

    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map((n) => (n.id === action.payload.id ? { ...n, unread: false } : n)) };

    case 'ADD_SUPPORT_TICKET': {
      const ticket: SupportTicket = { ...action.payload, id: `${Math.floor(1000 + Math.random() * 9000)}`, timeAgo: 'الآن' };
      return {
        ...state,
        supportTickets: [ticket, ...state.supportTickets],
        activityLogs: withLog(state.activityLogs, 'تذكرة دعم جديدة', `تم فتح تذكرة رقم #${ticket.id} للعميل "${ticket.customerName}".`, 'system'),
      };
    }

    case 'UPDATE_TICKET_STATUS':
      return {
        ...state,
        supportTickets: state.supportTickets.map((t) => (t.id === action.payload.id ? { ...t, status: action.payload.status } : t)),
        activityLogs: withLog(state.activityLogs, 'تحديث تذكرة دعم', `تم تغيير حالة التذكرة #${action.payload.id} إلى [${action.payload.status}].`, 'system'),
      };

    case 'ADD_TICKET_REPLY':
      return {
        ...state,
        supportTickets: state.supportTickets.map((t) =>
          t.id === action.payload.id
            ? { ...t, description: `${t.description}\n\nالإدارة: ${action.payload.replyText}`, lastMessageTime: 'تم الرد الآن' }
            : t
        ),
        activityLogs: withLog(state.activityLogs, 'رد على تذكرة', `تم تسجيل رد الإدارة على التذكرة #${action.payload.id}.`, 'system'),
      };

    case 'ADD_DEPARTMENT': {
      const dept: Department = {
        id: `dept-${Date.now()}`,
        name: action.payload.name,
        nameAr: action.payload.nameAr,
        description: action.payload.description,
        adminIds: [],
        productCount: 0,
        orderCount: 0,
        revenue: 0,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        departments: [...state.departments, dept],
        activityLogs: withLog(state.activityLogs, 'إضافة قسم جديد', `تم إنشاء قسم "${dept.nameAr}" في هيكل الأقسام.`, 'system'),
      };
    }

    case 'EDIT_DEPARTMENT':
      return {
        ...state,
        departments: state.departments.map((d) => (d.id === action.payload.id ? action.payload : d)),
        activityLogs: withLog(state.activityLogs, 'تحديث قسم', `تم تعديل بيانات قسم "${action.payload.nameAr}".`, 'system'),
      };

    case 'DELETE_DEPARTMENT': {
      const target = state.departments.find((d) => d.id === action.payload.id);
      if (!target) return state;
      return {
        ...state,
        departments: state.departments.filter((d) => d.id !== target.id),
        departmentAdmins: state.departmentAdmins.filter((a) => a.departmentId !== target.id),
        activityLogs: withLog(state.activityLogs, 'حذف قسم', `تمت إزالة قسم "${target.nameAr}" بالكامل مع مديريه.`, 'system'),
      };
    }

    case 'ADD_DEPARTMENT_ADMIN': {
      const admin: AdminUser = { ...action.payload, id: `admin-dept-${Date.now()}` };
      return {
        ...state,
        departmentAdmins: [...state.departmentAdmins, admin],
        departments: state.departments.map((d) =>
          d.id === admin.departmentId ? { ...d, adminIds: [...d.adminIds, admin.id] } : d
        ),
        activityLogs: withLog(state.activityLogs, 'إضافة مشرف قسم', `تم إضافة المشرف "${admin.name}" إلى نظام الأقسام.`, 'system'),
      };
    }

    case 'EDIT_DEPARTMENT_ADMIN': {
      const updated = action.payload;
      const prev = state.departmentAdmins.find((a) => a.id === updated.id);
      return {
        ...state,
        departmentAdmins: state.departmentAdmins.map((a) => (a.id === updated.id ? updated : a)),
        departments: state.departments.map((d) => {
          if (prev && prev.departmentId !== updated.departmentId) {
            const withoutPrev = d.adminIds.filter((id) => id !== updated.id);
            if (d.id === prev.departmentId) return { ...d, adminIds: withoutPrev };
            if (d.id === updated.departmentId) return { ...d, adminIds: [...d.adminIds, updated.id] };
          }
          return d;
        }),
        activityLogs: withLog(state.activityLogs, 'تحديث مشرف قسم', `تم تعديل بيانات المشرف "${updated.name}".`, 'system'),
      };
    }

    case 'DELETE_DEPARTMENT_ADMIN': {
      const target = state.departmentAdmins.find((a) => a.id === action.payload.id);
      if (!target) return state;
      return {
        ...state,
        departmentAdmins: state.departmentAdmins.filter((a) => a.id !== target.id),
        departments: state.departments.map((d) =>
          d.id === target.departmentId ? { ...d, adminIds: d.adminIds.filter((id) => id !== target.id) } : d
        ),
        activityLogs: withLog(state.activityLogs, 'حذف مشرف قسم', `تمت إزالة المشرف "${target.name}" من النظام.`, 'system'),
      };
    }

    case 'TOGGLE_DEPARTMENT_ADMIN_STATUS': {
      const target = state.departmentAdmins.find((a) => a.id === action.payload.id);
      if (!target) return state;
      const newStatus = target.status === 'active' ? 'disabled' : 'active';
      return {
        ...state,
        departmentAdmins: state.departmentAdmins.map((a) =>
          a.id === target.id ? { ...a, status: newStatus } : a
        ),
        activityLogs: withLog(state.activityLogs, newStatus === 'disabled' ? 'تعطيل مشرف' : 'تفعيل مشرف', `تم ${newStatus === 'disabled' ? 'تعطيل' : 'تفعيل'} حساب المشرف "${target.name}".`, 'system'),
      };
    }

    default:
      return state;
  }
}
