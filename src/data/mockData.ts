import { Product, Category, Order, Review, ActivityLog, Role, StoreSettings, Customer, Transaction, Coupon, StoreNotification, SupportTicket, Department, AdminUser } from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Anime Clothing', nameAr: 'ملابس انمي', description: 'ملابس وإكسسوارات مستوحاة من الأنمي', adminIds: ['admin-dept-1'], productCount: 1, orderCount: 2, revenue: 1920, createdAt: '2024-01-15' },
  { id: 'dept-2', name: 'Crochet', nameAr: 'كروشية', description: 'منتجات كروشيه يدوية فاخرة', adminIds: ['admin-dept-2'], productCount: 2, orderCount: 3, revenue: 230, createdAt: '2024-02-01' },
  { id: 'dept-3', name: 'Accessories', nameAr: 'إكسسوارات', description: 'ساعات ومجوهرات وإكسسوارات راقية', adminIds: [], productCount: 2, orderCount: 1, revenue: 45230, createdAt: '2024-03-01' },
  { id: 'dept-4', name: 'Books', nameAr: 'مكتبة', description: 'كتب ومطبوعات وقرطاسية فاخرة', adminIds: [], productCount: 2, orderCount: 1, revenue: 320, createdAt: '2024-04-01' },
];

export const DEPARTMENT_ADMINS: AdminUser[] = [
  { id: 'admin-dept-1', name: 'أحمد علي', email: 'ahmed.ali@sham presto.com', role: 'مشرف قسم الأنمي', roleType: 'department', departmentId: 'dept-1', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80', phone: '0911111111', password: 'anime1234', status: 'active', createdAt: '2024-01-15' },
  { id: 'admin-dept-2', name: 'سارة محمد', email: 'sara.mohamed@sham presto.com', role: 'مشرف قسم الكروشية', roleType: 'department', departmentId: 'dept-2', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', phone: '0922222222', password: 'crochet1234', status: 'active', createdAt: '2024-02-01' },
  { id: 'admin-dept-3', name: 'خالد عبدالله', email: 'khalid.abdullah@shampresto.com', role: 'مشرف قسم الإكسسوارات', roleType: 'department', departmentId: 'dept-3', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', phone: '0933333333', password: 'access1234', status: 'active', createdAt: '2024-03-10' },
  { id: 'admin-dept-4', name: 'نورة أحمد', email: 'noura.ahmed@shampresto.com', role: 'مشرف قسم المكتبة', roleType: 'department', departmentId: 'dept-4', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', phone: '0944444444', password: 'books1234', status: 'disabled', createdAt: '2024-04-05' },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'ساعات', icon: 'Watch', productCount: 42 },
  { id: '2', name: 'عطور', icon: 'Flame', productCount: 124 },
  { id: '3', name: 'كروشية', icon: 'Palette', productCount: 86 },
  { id: '4', name: 'ملابس انمي', icon: 'Shirt', productCount: 53 },
  { id: '5', name: 'مكتبة', icon: 'BookOpen', productCount: 215 },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'عطر الفخامة الذهبي',
    description: 'عطر شرقي فاخر يمزج بين العود الملكي والمسك الأبيض لرائحة تدوم طويلاً.',
    price: 245,
    stock: 42,
    category: 'عطور',
    departmentId: 'dept-3',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1JdM2W2OiyKZ9mZwUPaD5OwPw0IfTUB36c6AdS5BtUXu7ybanSMVRTvF1Bm4X2rze75RuGpOuHHI1eDd4p4Edr0vjr9wfsJoGSoQ3TDUwXtJqyYNl93ndydux9Fcy3Rps5bRtZIy9CAwmG7hKnBN-If1BejnrO9hbfLwLdmtvS9Efd4aBqWZ3POVWsabAkSVASlwQNmOLNHiCjXLQvYm6foxZjf0jz5n4IEy2ji-6_aR32xJFxIfIs57InyXiJ8TD69x5bnPReClN',
    isAvailable: true,
    isFeatured: true,
    sku: 'PER-GLD-01',
  },
  {
    id: '2',
    name: 'دمية كروشيه يدوية لطيفة',
    description: 'دمية مصنوعة يدوياً بالكامل من خيوط القطن الفاخرة، آمنة للأطفال وتصلح كهدية مميزة.',
    price: 85,
    stock: 120,
    category: 'كروشية',
    departmentId: 'dept-2',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbGnI-m3ZjBGT-QjSRqHR2E0e3LnLBEQqG8k81CIVEbt28GAD1OAu8Hlbwpwkgo8Y7CCKU-CgJRkYiJsxE2f6emENSDUkIuo_Zsv45RVQMYyWq7IRdfxYy2zXayAb7f8-B86bORpn7JEZqo5Qs3jP75rbyooSpvLgbQ7CnY60YGTR2xQvBrlFE9I8by7NS5KmZjVTCX0yh7u-2SicC1trXtIrqVNCp96rwXzof3P_JsTI7ADm1zRvsGlmxXrE1-ri1IjAOq2vD2hDh',
    isAvailable: true,
    isFeatured: false,
    sku: 'CRO-TOY-01',
  },
  {
    id: '3',
    name: 'كتاب روائع الأدب العالمي',
    description: 'مجموعة فاخرة مجلدة من كلاسيكيات الرواية والقصة بلمسة كلاسيكية للمكتبة المنزلية.',
    price: 320,
    stock: 25,
    category: 'مكتبة',
    departmentId: 'dept-4',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-5IVg6NLpJdAit5ttvndiEiZkO_XTo1bDv3m5QZzLpfivl9b5TOTN2qTfwIG4Y4p_PG5mYw6u8OnXtuzQQodfigRfvkVC1-UkeLFirLVisq7roZd5_LEk8pOVanC0NtqLYwm58ALKeMRvmHcjK7fFhbSzWlHtEbwIm37A3jvTJf4PPnmbbqDB_7hCmwmqdXWnre9JTugBVHqXpYCBiClnLbxr8KX8HohIeQLmGvLBkvPOvA8IlxhY6KOTB-NdQsIYwS_pBgj-z5u5',
    isAvailable: true,
    isFeatured: true,
    sku: 'BK-LIT-01',
  },
  {
    id: '4',
    name: 'سترة أنمي هجوم العمالقة',
    description: 'سترة شتوية ثقيلة بتطريز عالي الجودة لشعار فيلق الاستطلاع خلف الظهر.',
    price: 150,
    stock: 8,
    category: 'ملابس انمي',
    departmentId: 'dept-1',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBefI07cI5nu4dDlKD3BZz9j6PNa_WTnUtZEhNeZRohaMajEapoMqCVqwwLDqv8-c1-RFJ4r472IjFBL6EnOJOJFx2vHnuucQW0_sGQAP-TdDHnQtTUvw2fHwnOi_Jq_EmbcNXREURkl8gBsk5YsLv351NvmZGaTrZdAk_f5Nap7-azvzciC-rXnToJJW5nks7fxxpUdhIXgJJ9p8pM895amGdUX8BL_799Ff07M1TWOsoKi5C4qVbAwwPt3zFgzkvEblfXxJCePDNN',
    isAvailable: true,
    isFeatured: false,
    sku: 'SHR-ANM-AOT',
  },
  {
    id: '5',
    name: 'شال كروشيه دافئ وملون',
    description: 'شال شتوي طويل مغزول يدوياً من الصوف الفاخر بألوان زاهية ودافئة.',
    price: 145,
    stock: 5,
    category: 'كروشية',
    departmentId: 'dept-2',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAOS-gqGlTmUV1oBXwv6aPuSvousEbO2HhdXsELwzBM2dFItkcYJ0ac-HpuqylXhQkxYyZNry8RhLBn6VR7wi67OcVK-vdB0yoVCnE0ZHgXT80qVfY9e5RywdgsU814mBFR1gLD67FBDffFfCLLGdGaeIBkKjYvOHkTZRv1ZTVbIhwazg3Mcv-Y_qkK4Ep1KC6LXp29kaNxQSjp2Rl-A4I_AOidkWDdpghf4k8E-jdFCXcwAhHGqnvUxzfKt6OozGUF-IVcDvcZMcp',
    isAvailable: true,
    isFeatured: false,
    sku: 'CRO-SHL-01',
  },
  {
    id: '6',
    name: 'ساعة يد رقمية ذكية مقاومة للماء',
    description: 'ساعة يد رياضية ممتازة بشاشة عرض LED وحزام سيليكون ناعم مريح.',
    price: 180,
    stock: 142,
    category: 'ساعات',
    departmentId: 'dept-3',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVGblgea7m-bu_vWt7pJWJahdm4lIdRWEZapLQQNTdR7sHMmJhnhDd26xapmsARVNqgk6XGwLhYwAxLh-haLklMfBEOxFY7oK3dxwAVaYuQbEpdyHvxAoURoDaXrcJnTMbbqzCmYkOgTmbYgTstIm-mfd3my05mLWTvbqI37x6umFaB_piv7OqhKI-v_cfIgSB4IKY7Eti0hXU2JsYdb6gExmpXAeYIZbhT2JvwjSpLmZ1GUVGSEd-5XClmgEXC_yfY_wu77m-b-ch',
    isAvailable: true,
    isFeatured: true,
    sku: 'WAT-DIG-SLV',
  },
  {
    id: '7',
    name: 'دفتر ملاحظات جلدي فاخر',
    description: 'دفتر ملاحظات بأوراق مسطرة وغلاف جلدي طبيعي فاخر لعشاق الكتابة والتدوين.',
    price: 95,
    stock: 12,
    category: 'مكتبة',
    departmentId: 'dept-4',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpdBL3dUz_kEg-B1kKJrWyPZhVMBxQZ5E4IboTLFyHP4tZdAIZoeESIxt2NaT51WPLnLaJhLABbSFBNOAj7HwF71CKubnzT9Vu8ZNG36E80GYB81mSIIQ71WpLoZ47jdeGo6k_ckJYYkifOkZ0hzrOolPPPN17RgPYxPGEYSHpXQJARv1veTgk_yaT2swVV-ElCSPkA_wCHFQE_DIZA65vJ_osIcMk8E-wT8lL2asce1F5LKxoZqyfvyrwYKoix57wm5eNBm8pSp4-',
    isAvailable: true,
    isFeatured: false,
    sku: 'NB-LTH-BLU',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: '10492',
    customerName: 'أحمد محمد عبدالله',
    customerPhone: '+966 50 123 4567',
    customerAddress: 'شارع العليا العام، حي الملقا، مبنى رقم 45، شقة 12، الرياض، المملكة العربية السعودية',
    status: 'processing',
    date: '24 أكتوبر 2023',
    items: [
      {
        productId: 'WAT-LUX',
        productName: 'ساعة ميكانيكية فاخرة',
        productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2zKxKjrofyaWWitwSAG9baspOvGO73XljcwCkAB6iOaGEozL3VriFZjorhnF0QZxEsKGfnkJ4UWLhgx8r_mAbU824wQentacsqo1-K2mTrGUauDiJK3rpV5dT4JSwk9Cq3ycWVHwgM-uHwRNFfNF7Vr6JndlvzLvCfJGWVNoZet5O6dy3TAykRJuhVNZr71Y3dcgfgth_Uf9e9SxbyXD7U2DbWrnfi7WoAewFBi9tXLmQF8O6r-7x9S8xH1xNXgY1SXpMYEnWr-hf',
        price: 1250,
        quantity: 1,
        details: 'اللون: فضي، المقاس: موحد',
      },
      {
        productId: 'WLT-LTH-CL',
        productName: 'محفظة جلدية كلاسيكية',
        productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXu83eQVD5VBqXO8XVZ7U1lxVadQ2mlncj-78uS4NSmgX7O22WRX12mi-SCjzhIP4kIrUcog6kzDi7uY8vBv-walloNONzlefrxoWUhoEc3dQyZmBigVrOz6PZwtiECnK5kIlsqy6ktEj-V97Vk-kaWJH4wPB2174NBt_zGsE_5tuv85Ctk1dJphuhOqfuyMATE0iY37iYoSgeZgtFiCMVkmkz4AznD2tDiWbSyg5bi21-2mQan8oIVB4JKNXkTddq23Ng7p1BL9ixid',
        price: 350,
        quantity: 2,
        details: 'اللون: بني',
      },
    ],
    subtotal: 1950,
    shipping: 50,
    discount: 100,
    coupon: 'WELCOME',
    total: 1900,
    departmentIds: ['dept-3'],
    trackingTimeline: [
      { status: 'تم التسليم', description: 'الرياض، حي الملقا', time: 'جاري', active: false },
      { status: 'في الطريق', description: 'المندوب في طريقه إلى موقعك', time: '14:15', active: true },
      { status: 'استلام الشحنة', description: 'تم استلام الشحنة من المستودع الرئيسي', time: '09:30', active: true },
      { status: 'تأكيد الطلب', description: 'تم تأكيد الطلب وجاري التجهيز', time: 'الأمس، 18:45', active: true },
    ],
    courier: {
      name: 'أحمد محمود',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSNZ6wSJGxjb_QsJ4ATU7vyTHXlPSvzes2ErleWos6f90RGqKaJMDGQL1dNAxm3GODpe0Pw3nP-snBXqFT15szw5Gh_N6YW43g7v9DLetq5bRmg8aosOClA48dK48s_vWSWjRfL3ZLgMRyZzYho8fWxc5yyBXlMTFkxRn7P-mrLHx8MQcV6ykT3JqubiL3LIP-E6l5SnHZaCJcHdLJH4NdryqFlbaxEa0PMLDclsgFrjgB8f1MR054cOP8VBniftSctXhNnOwb1T_J',
      rating: '4.9',
      trips: '120 رحلة',
      phone: '+966 50 123 4567',
    },
  },
  {
    id: '10024',
    customerName: 'أحمد محمد',
    customerPhone: '+966 50 111 2222',
    customerAddress: 'طريق الملك فهد، حي الملقا، الرياض',
    status: 'pending',
    date: '12 أكتوبر 2023',
    items: [
      {
        productId: '5',
        productName: 'كوب سيراميك أسود',
        productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAOS-gqGlTmUV1oBXwv6aPuSvousEbO2HhdXsELwzBM2dFItkcYJ0ac-HpuqylXhQkxYyZNry8RhLBn6VR7wi67OcVK-vdB0yoVCnE0ZHgXT80qVfY9e5RywdgsU814mBFR1gLD67FBDffFfCLLGdGaeIBkKjYvOHkTZRv1ZTVbIhwazg3Mcv-Y_qkK4Ep1KC6LXp29kaNxQSjp2Rl-A4I_AOidkWDdpghf4k8E-jdFCXcwAhHGqnvUxzfKt6OozGUF-IVcDvcZMcp',
        price: 450,
        quantity: 10,
        details: 'اللون: أسود غامق',
      },
    ],
    subtotal: 450,
    shipping: 0,
    discount: 0,
    total: 450,
    departmentIds: ['dept-2'],
    trackingTimeline: [
      { status: 'في الطريق', description: 'المندوب في طريقه إلى موقعك', time: '-', active: false },
      { status: 'استلام الشحنة', description: 'تم استلام الشحنة من المستودع الرئيسي', time: '-', active: false },
      { status: 'تأكيد الطلب', description: 'تم تأكيد الطلب وجاري التجهيز', time: '12 أكتوبر 2023، 08:30 ص', active: true },
    ],
  },
  {
    id: '10023',
    customerName: 'سارة خالد',
    customerPhone: '+966 50 222 3333',
    customerAddress: 'شارع التخصصي، حي المعذر، الرياض',
    status: 'shipped',
    date: '11 أكتوبر 2023',
    items: [
      {
        productId: '3',
        productName: 'مصباح طاولة معدني',
        productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-5IVg6NLpJdAit5ttvndiEiZkO_XTo1bDv3m5QZzLpfivl9b5TOTN2qTfwIG4Y4p_PG5mYw6u8OnXtuzQQodfigRfvkVC1-UkeLFirLVisq7roZd5_LEk8pOVanC0NtqLYwm58ALKeMRvmHcjK7fFhbSzWlHtEbwIm37A3jvTJf4PPnmbbqDB_7hCmwmqdXWnre9JTugBVHqXpYCBiClnLbxr8KX8HohIeQLmGvLBkvPOvA8IlxhY6KOTB-NdQsIYwS_pBgj-z5u5',
        price: 320,
        quantity: 3,
      },
      {
        productId: '2',
        productName: 'كوب قهوة حرفي',
        productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbGnI-m3ZjBGT-QjSRqHR2E0e3LnLBEQqG8k81CIVEbt28GAD1OAu8Hlbwpwkgo8Y7CCKU-CgJRkYiJsxE2f6emENSDUkIuo_Zsv45RVQMYyWq7IRdfxYy2zXayAb7f8-B86bORpn7JEZqo5Qs3jP75rbyooSpvLgbQ7CnY60YGTR2xQvBrlFE9I8by7NS5KmZjVTCX0yh7u-2SicC1trXtIrqVNCp96rwXzof3P_JsTI7ADm1zRvsGlmxXrE1-ri1IjAOq2vD2hDh',
        price: 85,
        quantity: 3,
      },
    ],
    subtotal: 1215,
    shipping: 50,
    discount: 65,
    coupon: 'SAVE50',
    total: 1200,
    departmentIds: ['dept-2', 'dept-4'],
    trackingTimeline: [
      { status: 'تم التسليم', description: 'حي المعذر، الرياض', time: '-', active: false },
      { status: 'في الطريق', description: 'المندوب في طريقه إلى موقعك', time: '11 أكتوبر 2023، 15:45 م', active: true },
      { status: 'استلام الشحنة', description: 'تم استلام الشحنة من المستودع الرئيسي', time: '11 أكتوبر 2023، 10:20 ص', active: true },
      { status: 'تأكيد الطلب', description: 'تم تأكيد الطلب وجاري التجهيز', time: '10 أكتوبر 2023، 18:30 م', active: true },
    ],
  },
  {
    id: '10022',
    customerName: 'فهد عبدالله',
    customerPhone: '+966 50 333 4444',
    customerAddress: 'طريق العروبة، حي السليمانية، الرياض',
    status: 'delivered',
    date: '10 أكتوبر 2023',
    items: [
      {
        productId: '2',
        productName: 'كوب قهوة حرفي',
        productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbGnI-m3ZjBGT-QjSRqHR2E0e3LnLBEQqG8k81CIVEbt28GAD1OAu8Hlbwpwkgo8Y7CCKU-CgJRkYiJsxE2f6emENSDUkIuo_Zsv45RVQMYyWq7IRdfxYy2zXayAb7f8-B86bORpn7JEZqo5Qs3jP75rbyooSpvLgbQ7CnY60YGTR2xQvBrlFE9I8by7NS5KmZjVTCX0yh7u-2SicC1trXtIrqVNCp96rwXzof3P_JsTI7ADm1zRvsGlmxXrE1-ri1IjAOq2vD2hDh',
        price: 85,
        quantity: 1,
      },
    ],
    subtotal: 85,
    shipping: 0,
    discount: 0,
    total: 85,
    departmentIds: ['dept-2'],
    trackingTimeline: [
      { status: 'في الطريق', description: 'المندوب في طريقه إلى موقعك', time: '10 أكتوبر 2023، 12:15 م', active: true },
      { status: 'استلام الشحنة', description: 'تم استلام الشحنة من المستودع الرئيسي', time: '10 أكتوبر 2023، 09:30 ص', active: true },
      { status: 'تأكيد الطلب', description: 'تم تأكيد الطلب وجاري التجهيز', time: '09 أكتوبر 2023، 19:45 م', active: true },
    ],
  },
  {
    id: '10021',
    customerName: 'نورة علي',
    customerPhone: '+966 50 444 5555',
    customerAddress: 'طريق التخصصي، الرياض',
    status: 'cancelled',
    date: '09 أكتوبر 2023',
    items: [
      {
        productId: '4',
        productName: 'محفظة جلدية فاخرة',
        productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBefI07cI5nu4dDlKD3BZz9j6PNa_WTnUtZEhNeZRohaMajEapoMqCVqwwLDqv8-c1-RFJ4r472IjFBL6EnOJOJFx2vHnuucQW0_sGQAP-TdDHnQtTUvw2fHwnOi_Jq_EmbcNXREURkl8gBsk5YsLv351NvmZGaTrZdAk_f5Nap7-azvzciC-rXnToJJW5nks7fxxpUdhIXgJJ9p8pM895amGdUX8BL_799Ff07M1TWOsoKi5C4qVbAwwPt3zFgzkvEblfXxJCePDNN',
        price: 320,
        quantity: 1,
      },
    ],
    subtotal: 320,
    shipping: 0,
    discount: 0,
    total: 320,
    departmentIds: ['dept-1'],
    trackingTimeline: [
      { status: 'تم إلغاء الطلب', description: 'بناءً على طلب العميل', time: '09 أكتوبر 2023، 11:20 ص', active: true },
    ],
  },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    customerName: 'أحمد محمود',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXDK8LapmW_t2y3bkP_LITSBxfy1s6iOtrw-9zVpJayf8cIkQ6Q1mxVDFmGWE-uxJnH0Lw5xpewuWlYESy6Vo-OfJ0WfyRzMgzOsSb2hIoZB7V_6yJaC7X732rNrv6Y-qDYaZ0EWPWwQ8YakvLmvdJhWTuRp5CjD3rIxvNaezuk6vWDv7FkpyCBExI7J7s9ojVtGpWqdHiOoU-wccb9lZVOxXg6PPrxXYyrVGdRUQ5I8wIj441dCksAdC9o07-Q3NaUIXYe-pqb7Yt',
    date: 'قبل يومين',
    rating: 5,
    productName: 'ساعة ذكية فاخرة الإصدار الثامن',
    productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWHhWTmnGfsT-i3HtsUhZbsemElxPmmEdBAcp10N7NNDLdE_K8AsO5AfN7ytYj9Xp961RZz9xSK29pnz03RAOWgOQwlQHzDQFCt6I2Yu_qLmRLLymRYuL1KJxyl0G44sYbMCTnR-h_Myut-MKcg_-N3dCnhupT8QZSjW-aC-dVM9jC9UcrdgT9by6qLbj_Rv8gibpH1qkie8I7JkjC4xDpfe8GaLAwYKqZflS3CBC8Akk6X4n_sZAIOs-CgkU0UD5gwGaFDbMQupjk',
    comment: 'منتج ممتاز جداً وتغليف راقي. التوصيل كان سريعاً والخدمة ممتازة. أنصح بالتعامل مع المتجر.',
  },
  {
    id: 'rev-2',
    customerName: 'سارة الخالد',
    date: 'قبل أسبوع',
    rating: 3,
    productName: 'حقيبة جلد طبيعي كلاسيكية',
    productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATUbVM3zoYjiUyse0DZLeUV7_yz7xOfrNfwPhX4fVvkYvdhWRnfapn4XoZoSQAZLMZbv3qDBjjyLpkNmiFWSeOvQdtPPfaujJb6a6ke1567uQcg9SxJcAVXJNEtcjuXUYr4i9WNLxjfzH2rlxVVhMNyIyms_GN1zV4y9soy47qoQJSYZedfIVafbpyPxowuvUapqWvXcYCH99RPow3V7OWjGxeW-4TUTzONX_m--vl_Um_F89j_iWZ-igO5SqweT66ExRpMyKwLTRH',
    comment: 'الجودة جيدة ولكن اللون يختلف قليلاً عن الصورة المعروضة في الموقع. التغليف كان يمكن أن يكون أفضل.',
    storeReply: 'أهلاً سارة، نعتذر عن هذا اللبس. نرجو التواصل مع خدمة العملاء لترتيب استبدال المنتج إذا رغبتِ بذلك.',
  },
  {
    id: 'rev-3',
    customerName: 'عمر عبدالله',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCidmT9SYVOVVQM9XfJ0niWw5EEBUcjBrT6iYpexRR0gxYnbUZRmNzzLYGSS7TrN7xPDtH73xBDls1yazXi0EqzdLH22Rc_qAxdUWZFF7Mof4iixvLoLfKAiG6SPovbch_qrEXTD4qNPc23blX4V7S0QTwBul6wa2ry7d3rbC1Ph7IH5HzElFk5BNk93Lhn1q5PYHtXx8IDK3Yrq9vf9db1gfFSHkUKI2el_MaIlaP54QHdbjzMl_iBoh76zpmWGHiPGsFpFkQcWMZA',
    date: '12 مايو 2023',
    rating: 4,
    productName: 'طقم مكتب تنفيذي أسود',
    productImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuV_A0Q8N9HIIXgaAkDti4-3PHmYV1-_WCg6vur17ZhQOeLqW1qqoXu7fwY2xC758AUegPHHpebz7-MpRLXYjCo0mpAocavCBEZsV37l_r18uZRKDe-HVIZ3LHPcLd4OAk-L850cTxi8zElJ9drd7znlTpLf2PYfu7TVNn5bmt3AZO4lKe2tuIhi5_YPnKMgFdHM89sifZZ-tcsCA2dPgRC8tbuI7mAXlZiFOfGTkbXiXP5mnn0wi39ke4BGq3VMxYfzoOcbQzEk1Y',
    comment: 'تصميم أنيق جداً ويضيف لمسة فخمة للمكتب. الخامة ممتازة، لكن السعر مرتفع قليلاً مقارنة بمنتجات مشابهة.',
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    time: 'منذ 10 دقائق',
    title: 'تحديث منتج',
    description: 'قام أحمد علي بتحديث تفاصيل المنتج ساعة يد فاخرة.',
    type: 'product',
    status: 'مكتمل',
    statusColor: 'bg-[#E8F5E9] text-[#2E7D32]',
  },
  {
    id: 'log-2',
    time: 'منذ ساعتين',
    title: 'إرجاع طلب',
    description: 'تم معالجة طلب إرجاع للطلب #ORD-2023-998 بواسطة نظام الإدارة. "العميل طلب إرجاع بسبب خطأ في المقاس. تم الموافقة."',
    type: 'order',
    status: 'معالجة',
    statusColor: 'bg-[#FFF3E0] text-[#E65100]',
  },
  {
    id: 'log-3',
    time: 'أمس، 14:30',
    title: 'تسجيل عميل جديد',
    description: 'تم تسجيل حساب جديد للعميلة سارة محمود.',
    type: 'customer',
  },
];

export const INITIAL_ROLES: Role[] = [
  {
    id: 'role-1',
    name: 'Admin',
    nameAr: 'مدير النظام (Admin)',
    description: 'وصول كامل لجميع إعدادات المتجر، بما في ذلك إدارة الصلاحيات والبيانات المالية.',
    usersCount: 3,
    permissionsAr: ['الوصول الكامل', 'إدارة المستخدمين', 'التقارير المالية'],
  },
  {
    id: 'role-2',
    name: 'Manager',
    nameAr: 'مدير المتجر (Manager)',
    description: 'إدارة الطلبات، المنتجات، والعملاء. لا يمكنه تعديل إعدادات الدفع أو الصلاحيات.',
    usersCount: 5,
    permissionsAr: ['إدارة الطلبات', 'تعديل المنتجات', 'دعم العملاء'],
  },
  {
    id: 'role-3',
    name: 'Editor',
    nameAr: 'محرر محتوى (Editor)',
    description: 'إضافة وتعديل المنتجات، المقالات، والمحتوى التسويقي فقط.',
    usersCount: 12,
    permissionsAr: ['إضافة منتجات', 'تعديل المحتوى', 'إدارة المدونة'],
  },
];

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'sham presto',
  storeDesc: 'متجر متخصص في بيع المنتجات الفاخرة والعصرية بأعلى جودة ممكنة.',
  phone: '50 123 4567',
  city: 'الرياض',
  address: 'طريق الملك فهد، حي الملقا، مبنى 45',
  logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL0BZBW1yaOED27drrinWkcfzWMdZbQP713l7pXDHTVY4Tyat-5lnGQ--1oIqtBiWD4d5CRiSblslfiQYSrYGpbOs-am_CM2mRswgjvj_p9Nujf-CDfCtHbfRIyZroO3SMf8faLTO6m0foml2VP8pJ_ZfGYQVj7xD2LPSVGMh5wTHssmOB1T1TEPX8qF6yw1pqdWfAHp9v2qZlSqOMF6YQT1xtKRUyfrmZoVI0zmTIIWW6Rksjc3THFUceHYkLLseSIvFw41vq7Rie',
  maintenanceMode: false,
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-1',
    name: 'أحمد محمود',
    email: 'ahmed.mahmoud@example.com',
    phone: '+971 50 123 4567',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    status: 'Loyal',
    totalOrders: 34,
    lifetimeValue: 45200,
    city: 'دبي، الإمارات العربية المتحدة',
    memberSince: 'Oct 2021',
    recentOrders: [
      { id: 'ORD-092', date: '12 Oct 2023', status: 'تم التوصيل', value: 'AED 2,450' },
      { id: 'ORD-087', date: '28 Sep 2023', status: 'تم التوصيل', value: 'AED 1,120' },
      { id: 'ORD-075', date: '05 Sep 2023', status: 'مسترجع', value: 'AED 850' },
    ],
    contactLog: [
      { date: '15 Oct 2023', time: '14:30', title: 'استفسار عن الشحن', description: 'تم حل المشكلة عبر الهاتف. العميل سأل عن موعد تسليم الطلب #ORD-092.' },
      { date: '05 Sep 2023', time: '09:15', title: 'طلب استرجاع', description: 'طلب استرجاع للطلب #ORD-075 بسبب خطأ في المقاس. تم قبول الطلب.' },
    ]
  },
  {
    id: 'CUST-2',
    name: 'Ahmad Salem',
    email: 'ahmad.s@example.com',
    phone: '+971 50 123 4567',
    status: 'Active',
    totalOrders: 24,
    lifetimeValue: 3450,
    city: 'الشارقة، الإمارات العربية المتحدة',
    memberSince: 'Jan 2022',
    recentOrders: [
      { id: 'ORD-064', date: '14 Jun 2023', status: 'تم التوصيل', value: 'AED 1,450' }
    ]
  },
  {
    id: 'CUST-3',
    name: 'Fatima Al Hashmi',
    email: 'f.hashmi@corporate.ae',
    phone: '+971 55 987 6543',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    status: 'Inactive',
    totalOrders: 2,
    lifetimeValue: 120,
    city: 'أبوظبي، الإمارات العربية المتحدة',
    memberSince: 'Jul 2023'
  },
  {
    id: 'CUST-4',
    name: 'Omar Mansour',
    email: 'omar.m@domain.com',
    phone: '+966 50 111 2222',
    status: 'Loyal',
    totalOrders: 89,
    lifetimeValue: 12890,
    city: 'الرياض، المملكة العربية السعودية',
    memberSince: 'Mar 2020'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TRX-9021',
    customerName: 'أحمد محمد',
    customerInitials: 'أ.م',
    date: '12 أكتوبر 2023',
    time: '14:30',
    amount: 45230,
    status: 'success'
  },
  {
    id: 'TRX-9022',
    customerName: 'سارة عبدالله',
    customerInitials: 'س.ع',
    date: '12 أكتوبر 2023',
    time: '15:15',
    amount: 1120,
    status: 'success'
  },
  {
    id: 'TRX-9023',
    customerName: 'محمود خالد',
    customerInitials: 'م.خ',
    date: '12 أكتوبر 2023',
    time: '16:45',
    amount: 850,
    status: 'success'
  },
  {
    id: 'TRX-9024',
    customerName: 'نور ياسين',
    customerInitials: 'ن.ي',
    date: '13 أكتوبر 2023',
    time: '09:10',
    amount: 3150,
    status: 'pending'
  },
  {
    id: 'TRX-9025',
    customerName: 'فاطمة رشيد',
    customerInitials: 'ف.ر',
    date: '13 أكتوبر 2023',
    time: '11:22',
    amount: 2450,
    status: 'failed'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'COUP-1',
    code: 'SUMMER24',
    discount: '20%',
    description: 'خصم على جميع الطلبات فوق 500 ريال',
    usage: '85 / 100',
    usagePercentage: 85,
    expiry: 'ينتهي في 31 أغسطس 2024',
    status: 'active'
  },
  {
    id: 'COUP-2',
    code: 'WELCOME50',
    discount: '50 ر.س',
    description: 'خصم ثابت للعملاء الجدد فقط',
    usage: '412 / ∞',
    usagePercentage: 41,
    expiry: 'بدون تاريخ انتهاء',
    status: 'active'
  },
  {
    id: 'COUP-3',
    code: 'VIPFALL',
    discount: '15%',
    description: 'خصم لعملاء VIP - مجموعة الخريف',
    usage: '0 / 50',
    usagePercentage: 0,
    expiry: 'يبدأ في 1 سبتمبر 2024',
    status: 'scheduled'
  }
];

export const INITIAL_NOTIFICATIONS: StoreNotification[] = [
  {
    id: 'NOT-1',
    type: 'order',
    title: 'طلب جديد #ORD-8923',
    description: 'تم استلام طلب جديد بقيمة 1,250 ريال. يرجى مراجعة وتأكيد الطلب.',
    time: 'منذ 5 دقائق',
    unread: true,
    actionLabel: 'عرض الطلب'
  },
  {
    id: 'NOT-2',
    type: 'inventory',
    title: 'تحذير: انخفاض المخزون',
    description: 'المنتج "عطر العود الفاخر" وصل للحد الأدنى (تبقى 3 قطع فقط).',
    time: 'منذ 45 دقيقة',
    unread: true
  },
  {
    id: 'NOT-3',
    type: 'system',
    title: 'تحديث النظام ناجح',
    description: 'تم تحديث نظام إدارة الطلبات إلى الإصدار 2.4. لا توجد إجراءات مطلوبة.',
    time: 'أمس، 11:30 م',
    unread: false
  },
  {
    id: 'NOT-4',
    type: 'shipping',
    title: 'تم شحن الطلب #ORD-8901',
    description: 'تم تسليم الشحنة لشركة التوصيل. جاري التتبع.',
    time: '24 مايو، 09:15 ص',
    unread: false
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: '1042',
    title: 'مشكلة في إتمام الدفع',
    customerName: 'Ahmad Al-Fayed',
    category: 'Urgent',
    description: 'العميل يواجه مشكلة متكررة عند محاولة الدفع باستخدام بطاقة مدى. يظهر خطأ 502 في بوابة دفع البنك التجاري...',
    status: 'Urgent',
    lastMessageTime: 'Last message: 10 mins ago',
    timeAgo: 'منذ 10 دقائق'
  },
  {
    id: '1041',
    title: 'تأخير في التوصيل',
    customerName: 'Sarah K',
    category: 'Open',
    description: 'الطلب متأخر يومين عن الموعد المحدد. حاولت التواصل مع المندوب ولم يرد على الاتصالات المتكررة...',
    status: 'Open',
    lastMessageTime: 'Last message: 2 hours ago',
    timeAgo: 'منذ ساعتين'
  },
  {
    id: '1040',
    title: 'استرجاع منتج',
    customerName: 'Mohammed R',
    category: 'Open',
    description: 'أرغب في استرجاع المنتج لوجود عيب مصنعي في الغطاء وتسرب جزء من السائل قبل فتحه.',
    status: 'Open',
    lastMessageTime: 'Last message: 4 hours ago',
    timeAgo: 'منذ 4 ساعات'
  },
  {
    id: '1039',
    title: 'تعديل عنوان الشحن',
    customerName: 'Laila M',
    category: 'Resolved',
    description: 'تم تعديل العنوان بنجاح. شكراً لتعاونكم السريع في تعديل حي النرجس بدلاً من حي الملقا.',
    status: 'Resolved',
    lastMessageTime: 'Last message: Yesterday',
    timeAgo: 'أمس'
  }
];
