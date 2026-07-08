import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  Animated,
} from 'react-native';
import { useNavigationState, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import Sidebar, { SIDEBAR_EXPANDED, SIDEBAR_COLLAPSED, SHOW_PAYMENTS } from './Sidebar';

import DashboardScreen from '../../screens/DashboardScreen';
import ProductsScreen from '../../screens/ProductsScreen';
import CategoriesScreen from '../../screens/CategoriesScreen';
import InventoryScreen from '../../screens/InventoryScreen';
import OrdersScreen from '../../screens/OrdersScreen';
import CustomersScreen from '../../screens/CustomersScreen';
import CouponsScreen from '../../screens/CouponsScreen';
import NotificationsScreen from '../../screens/NotificationsScreen';
import SupportScreen from '../../screens/SupportScreen';
import ReviewsScreen from '../../screens/ReviewsScreen';
import RolesScreen from '../../screens/RolesScreen';
import ActivityLogScreen from '../../screens/ActivityLogScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import DepartmentsScreen from '../../screens/DepartmentsScreen';
import DepartmentAdminManagementScreen from '../../screens/DepartmentAdminManagementScreen';
/* Payments screen — kept for future re-enable via SHOW_PAYMENTS flag in Sidebar */
import PaymentsScreen from '../../screens/PaymentsScreen';

import { DrawerParamList } from '../../navigation/types';
import RegisterScreen from '@/screens/RegisterScreen';

export type MainStackParamList = {
  Dashboard: undefined;
  Products: undefined;
  Categories: undefined;
  Inventory: undefined;
  Orders: undefined;
  Customers: undefined;
  Payments: undefined;
  Coupons: undefined;
  Register: undefined;
  Notifications: undefined;
  Support: undefined;
  Reviews: undefined;
  Roles: undefined;
  ActivityLog: undefined;
  Settings: undefined;
  DepartmentManagement: undefined;
  DepartmentAdminManagement: undefined;
};

export type MainNav = NativeStackNavigationProp<MainStackParamList>;

const Stack = createNativeStackNavigator<MainStackParamList>();

function MainContentStack() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: "simple_push",
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      {SHOW_PAYMENTS && <Stack.Screen name="Payments" component={PaymentsScreen as React.ComponentType<any>} />}
      <Stack.Screen name="Customers" component={CustomersScreen} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="Coupons" component={CouponsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="Roles" component={RolesScreen} />
      <Stack.Screen name="ActivityLog" component={ActivityLogScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="DepartmentManagement" component={DepartmentsScreen} />
      <Stack.Screen name="DepartmentAdminManagement" component={DepartmentAdminManagementScreen} />
    </Stack.Navigator>
  );
}

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const isMobile = width < 768;

  const activeRoute = useNavigationState((state) => {
    // Recursively walk the navigation state tree to find the innermost active route.
    const findActive = (s: { routes?: { name: string; state?: unknown }[]; index?: number } | null | undefined): string => {
      if (!s || !s.routes || typeof s.index !== 'number') return 'Dashboard';
      const activeChild = s.routes[s.index];
      if (activeChild?.state) {
        return findActive(activeChild.state as { routes?: { name: string; state?: unknown }[]; index?: number });
      }
      return activeChild?.name ?? 'Dashboard';
    };
    return findActive(state);
  });

  const handleNavigate = useCallback(
    (route: string) => {
      if (isMobile) {
        setMobileOpen(false);
      }
      (navigation as any).navigate('Main', { screen: route });
    },
    [navigation, isMobile]
  );

  return (
    <View style={styles.container}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar
          activeRoute={activeRoute}
          onNavigate={handleNavigate}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && mobileOpen && (
        <Animated.View style={[styles.mobileOverlay]}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setMobileOpen(false)}
          />
          <View style={[styles.mobileSidebar, { backgroundColor: theme.colors.surface }]}>
            <Sidebar
              activeRoute={activeRoute}
              onNavigate={handleNavigate}
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              forceShow
            />
          </View>
        </Animated.View>
      )}

      {/* Main content */}
      <View style={styles.contentArea}>
        {/* Mobile header */}
        {isMobile && (
          <View style={[styles.mobileHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <Pressable
              onPress={() => setMobileOpen(true)}
              style={styles.hamburger}
            >
              <Ionicons name="menu-outline" size={22} color={theme.colors.textPrimary} />
            </Pressable>
          </View>
        )}
        <MainContentStack />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  contentArea: {
    flex: 1,
    overflow:'hidden',
  },
  mobileOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: {
    flex:1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  mobileSidebar: {
    width: 280,
    height: '100%',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  hamburger: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
