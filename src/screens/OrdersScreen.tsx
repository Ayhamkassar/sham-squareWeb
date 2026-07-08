import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, SearchBar, EmptyState, SegmentedControl } from '../components/ui';
import { formatCurrency } from '../utils/formatters';
import { Order } from '../types';
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from './orderStatus';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function OrdersScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, loading } = useStore();
  const { isDepartmentAdmin, adminDepartmentId } = useAuth();
  const navigation = useNavigation<Nav>();

  const FILTER_OPTIONS: { key: string; label: string }[] = useMemo(() => [
    { key: 'all', label: t('الكل') },
    { key: 'pending', label: t('معلق') },
    { key: 'processing', label: t('قيد المعالجة') },
    { key: 'shipped', label: t('مشحون') },
    { key: 'delivered', label: t('مكتمل') },
    { key: 'cancelled', label: t('ملغي') },
  ], [t]);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const scopedOrders = useMemo(
    () => isDepartmentAdmin && adminDepartmentId
      ? state.orders.filter((o) => o.departmentIds?.includes(adminDepartmentId))
      : state.orders,
    [isDepartmentAdmin, adminDepartmentId, state.orders]
  );

  const orders = useMemo(
    () => scopedOrders.filter((o) => {
      const matchesFilter = filter === 'all' || o.status === filter;
      const matchesQuery = o.customerName.includes(query) || o.id.includes(query);
      return matchesFilter && matchesQuery;
    }),
    [scopedOrders, filter, query]
  );

  return (
    <ScreenContainer>
      <SearchBar value={query} onChangeText={setQuery} placeholder={t('بحث في النظام...')} />

      <SegmentedControl options={FILTER_OPTIONS} selected={filter} onSelect={setFilter} />

      {loading ? (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : orders.length === 0 ? (
        <EmptyState icon="cart-outline" title={t('لا توجد نتائج')} subtitle={t('حاول تغيير معايير البحث')} />
      ) : (
        orders.map((order) => (
          <Pressable key={order.id} onPress={() => navigation.navigate('OrderDetails', { order })}>
            <Card style={styles.orderCard}>
              <View style={styles.rowBetween}>
                <View style={styles.orderIdRow}>
                  <View style={[styles.idBadge, { backgroundColor: theme.colors.surfaceAlt }]}>
                    <Text style={[styles.idText, { color: theme.colors.textPrimary }]}>#{order.id}</Text>
                  </View>
                  <Badge label={t(ORDER_STATUS_LABEL[order.status])} tone={ORDER_STATUS_TONE[order.status]} size="sm" />
                </View>
                <Text style={[styles.amount, { color: theme.colors.textPrimary }]}>{formatCurrency(order.total)}</Text>
              </View>
              <View style={styles.customerRow}>
                <View style={[styles.avatarLetter, { backgroundColor: theme.colors.accentLight }]}>
                  <Text style={{ color: theme.colors.accent, fontSize: 12, fontWeight: '700' }}>
                    {order.customerName.charAt(0)}
                  </Text>
                </View>
                <Text style={[styles.customer, { color: theme.colors.textSecondary }]}>{order.customerName}</Text>
              </View>
              <View style={styles.rowBetween}>
                <Text style={[styles.date, { color: theme.colors.textMuted }]}>{order.date}</Text>
                <Text style={[styles.items, { color: theme.colors.textMuted }]}>{order.items.length} {t('منتجات')}</Text>
              </View>
            </Card>
          </Pressable>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  orderCard: { gap: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  idBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  idText: { fontSize: 12, fontWeight: '700' },
  amount: { fontSize: 15, fontWeight: '700' },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarLetter: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  customer: { fontSize: 13, fontWeight: '500' },
  date: { fontSize: 11 },
  items: { fontSize: 11 },
});
