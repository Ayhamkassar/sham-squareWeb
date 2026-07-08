import { Order, Customer } from '../types';

/** Drawer holds every primary section — mirrors the original Sidebar nav items. */
export type DrawerParamList = {
  Dashboard: undefined;
  Products: undefined;
  Categories: undefined;
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

/** Root stack wraps the Drawer and pushes detail screens above it (modal-style). */
export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  OrderDetails: { order: Order };
  CustomerDetails: { customer: Customer };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
