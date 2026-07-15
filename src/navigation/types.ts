import { Order, Customer } from '../types';

export type DrawerParamList = {
  Dashboard: undefined;
  Products: undefined;
  Categories: undefined;
  SubCategories: undefined;
  Inventory: undefined;
  Orders: undefined;
  Customers: undefined;
  Payments: undefined;
  Coupons: undefined;
  Notifications: undefined;
  Support: undefined;
  Reviews: undefined;
  Roles: undefined;
  ActivityLog: undefined;
  Settings: undefined;
  DepartmentManagement: undefined;
  DepartmentAdminManagement: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { identifier?: string } | undefined;
  OtpVerification: { phone: string } | undefined;
  OrderDetails: { order: Order };
  CustomerDetails: { customer: Customer };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
