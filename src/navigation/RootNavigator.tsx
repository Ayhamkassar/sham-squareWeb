import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { RootStackParamList } from './types';

import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import CustomerDetailsScreen from '../screens/CustomerDetailsScreen';
import RegisterScreen from '../screens/RegisterScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { theme } = useTheme();
  const { t } = useLocale();

  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: { fontWeight: '600', fontSize: 16 },
        presentation: 'card',
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <RootStack.Screen name="Main" component={DashboardLayout} options={{ headerShown: false }} />
      <RootStack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: t('تفاصيل الطلب') }} />
      <RootStack.Screen name="CustomerDetails" component={CustomerDetailsScreen} options={{ title: t('ملف العميل') }} />
      <RootStack.Screen name="Register" component={RegisterScreen} />
    </RootStack.Navigator>
  );
}
