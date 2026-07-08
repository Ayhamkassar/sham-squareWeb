import React, { useMemo, useRef, useEffect } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, StatCard, Divider } from '../components/ui';
import { formatCurrency } from '../utils/formatters';
import { RootStackParamList } from '../navigation/types';
import { Order } from '../types';
import { ORDER_STATUS_TONE, ORDER_STATUS_LABEL } from './orderStatus';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CHART_DATA = [
  { label: 'يناير', value: 65, secondary: 40 },
  { label: 'فبراير', value: 45, secondary: 30 },
  { label: 'مارس', value: 80, secondary: 55 },
  { label: 'أبريل', value: 55, secondary: 35 },
  { label: 'مايو', value: 90, secondary: 60 },
  { label: 'يونيو', value: 70, secondary: 50 },
  { label: 'يوليو', value: 85, secondary: 58 },
];

const PERIODS = ['أسبوع', 'شهر', 'سنة'];
const PERIOD_OPTIONS = PERIODS.map((p) => ({ key: p, label: p }));

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, loading } = useStore();
  const { isDepartmentAdmin, adminDepartmentId, isSuperAdmin, adminUser } = useAuth();
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const isCompact = width < 600;

  const department = useMemo(
    () => isDepartmentAdmin ? state.departments.find((d) => d.id === adminDepartmentId) : null,
    [isDepartmentAdmin, adminDepartmentId, state.departments]
  );

  const scopedProducts = useMemo(
    () => isDepartmentAdmin && adminDepartmentId
      ? state.products.filter((p) => p.departmentId === adminDepartmentId)
      : state.products,
    [isDepartmentAdmin, adminDepartmentId, state.products]
  );

  const scopedOrders = useMemo(
    () => isDepartmentAdmin && adminDepartmentId
      ? state.orders.filter((o) => o.departmentIds?.includes(adminDepartmentId))
      : state.orders,
    [isDepartmentAdmin, adminDepartmentId, state.orders]
  );

  const activeProductsCount = useMemo(() => scopedProducts.filter((p) => p.isAvailable).length, [scopedProducts]);
  const totalSales = useMemo(() => scopedOrders.reduce((sum, o) => sum + o.total, 0), [scopedOrders]);
  const recentOrders = scopedOrders.slice(0, 5);
  const topProducts = useMemo(
    () => [...scopedProducts].sort((a, b) => b.stock - a.stock).slice(0, 4),
    [scopedProducts]
  );

  const totalOrdersValue = useMemo(
    () => scopedOrders.reduce((sum, o) => sum + o.total, 0),
    [scopedOrders]
  );

  return (
    <ScreenContainer>
      {loading ? (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : (
      <>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textPrimary }]}>
            {isSuperAdmin ? t('نظرة عامة') : (department?.nameAr ?? t('نظرة عامة'))}
          </Text>
          <Text style={[styles.greetingSub, { color: theme.colors.textMuted }]}>
            {isSuperAdmin ? t('ملخص أداء المتجر لهذا الشهر') : `${t('ملخص أداء القسم')} ${department?.nameAr ?? ''}`}
          </Text>
        </View>
        <View style={[styles.periodChip, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}>
          <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '500' }}>{t('هذا الشهر')}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={[styles.statsGrid, isCompact && styles.statsGridCompact]}>
        <StatCard
          icon="cash-outline"
          label={t('إجمالي المبيعات')}
          value={formatCurrency(totalSales)}
          trend="+12.4%"
          color={theme.colors.accent}
        />
        <StatCard
          icon="receipt-outline"
          label={t('طلبات اليوم')}
          value={String(scopedOrders.length)}
          trend="+4.1%"
          color={theme.colors.info}
        />
        <StatCard
          icon="cube-outline"
          label={t('المنتجات النشطة')}
          value={String(activeProductsCount)}
          trend="+8.2%"
          color={theme.colors.success}
        />
        <StatCard
          icon="people-outline"
          label={t('العملاء')}
          value={String(state.customers.length)}
          trend="+2.3%"
          color={theme.colors.warning}
        />
      </View>

      {/* Revenue Chart Card */}
      <Card style={styles.revenueCard}>
        <View style={styles.revenueHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('اتجاهات الإيرادات')}</Text>
            <Text style={[styles.sectionSub, { color: theme.colors.textMuted }]}>{t('المدفوعات والأرباح المحققة خلال الفترة الحالية')}</Text>
          </View>
          <View style={styles.chipRow}>
            {PERIODS.map((period) => (
              <Pressable
                key={period}
                style={[
                  styles.chip,
                  { backgroundColor: period === 'شهر' ? theme.colors.accentLight : 'transparent' },
                ]}
              >
                <Text style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: period === 'شهر' ? theme.colors.accent : theme.colors.textMuted,
                }}>
                  {t(period)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Premium Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartArea}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((line) => (
              <View
                key={line}
                style={[
                  styles.gridLine,
                  { backgroundColor: theme.colors.borderLight, top: `${100 - line}%` as any },
                ]}
              />
            ))}
            {/* Bars with gradient effect */}
            <View style={styles.barsRow}>
              {CHART_DATA.map((d, i) => (
                <ChartBar
                  key={i}
                  height={d.value}
                  secondaryHeight={d.secondary}
                  color={theme.colors.accent}
                  areaColor={theme.colors.chartArea[0]}
                  delay={i * 80}
                  label={d.label}
                />
              ))}
            </View>
          </View>
          {/* X-axis labels */}
          <View style={styles.chartLabels}>
            {CHART_DATA.map((d, i) => (
              <Text key={i} style={[styles.chartLabelText, { color: theme.colors.textMuted }]}>
                {d.label}
              </Text>
            ))}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.accent }]} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>{t('الإيرادات')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.accent, opacity: 0.4 }]} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>{t('الأرباح')}</Text>
          </View>
        </View>
      </Card>

      {/* Recent Orders + Top Products row */}
      <View style={[styles.twoCol, isCompact && styles.twoColCompact]}>
        {/* Recent Orders */}
        <Card style={{ flex: 1 }}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('الطلبات الأخيرة')}</Text>
              <Text style={[styles.sectionSub, { color: theme.colors.textMuted }]}>{t('مراقبة وإدارة أحدث عمليات الشراء')}</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('Main', { screen: 'Orders' } as never)}>
              <Text style={[styles.viewAll, { color: theme.colors.accent }]}>{t('عرض الكل')}</Text>
            </Pressable>
          </View>
          <View style={{ height: 12 }} />
          {recentOrders.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', paddingVertical: 20 }}>
              {t('لا توجد طلبات حالياً')}
            </Text>
          ) : (
            recentOrders.map((order: Order, idx: number) => (
              <Pressable
                key={order.id}
                onPress={() => navigation.navigate('OrderDetails', { order })}
                style={[
                  styles.orderRow,
                  { borderColor: theme.colors.borderLight },
                  idx === 0 && { borderTopWidth: 0, paddingTop: 0, marginTop: 0 },
                ]}
              >
                <View style={[styles.orderIdCircle, { backgroundColor: theme.colors.surfaceAlt }]}>
                  <Text style={[styles.orderIdText, { color: theme.colors.textPrimary }]}>#{order.id}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.orderCustomer, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                    {order.customerName}
                  </Text>
                  <Text style={[styles.orderDate, { color: theme.colors.textMuted }]}>{order.date}</Text>
                </View>
                <Badge label={t(ORDER_STATUS_LABEL[order.status])} tone={ORDER_STATUS_TONE[order.status]} size="sm" />
                <Text style={[styles.orderAmount, { color: theme.colors.textPrimary }]}>{formatCurrency(order.total)}</Text>
              </Pressable>
            ))
          )}
        </Card>

        {/* Top Products */}
        <Card style={{ flex: 1 }}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('الأكثر مبيعاً')}</Text>
              <Text style={[styles.sectionSub, { color: theme.colors.textMuted }]}>{t('أفضل السلع أداءً')}</Text>
            </View>
          </View>
          <View style={{ height: 12 }} />
          {topProducts.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', paddingVertical: 20 }}>
              {t('لا توجد منتجات')}
            </Text>
          ) : (
            topProducts.map((product, idx) => (
              <View
                key={product.id}
                style={[
                  styles.productRow,
                  { borderColor: theme.colors.borderLight },
                  idx === 0 && { borderTopWidth: 0, paddingTop: 0, marginTop: 0 },
                ]}
              >
                <View style={styles.productRank}>
                  <Text style={[styles.rankNum, { color: theme.colors.textMuted }]}>{idx + 1}</Text>
                </View>
                <Image source={{ uri: product.image }} style={styles.productImg} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.productName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={[styles.productMeta, { color: theme.colors.textMuted }]}>
                    {product.category}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.productPrice, { color: theme.colors.textPrimary }]}>{formatCurrency(product.price)}</Text>
                  <Text style={[styles.productStock, { color: theme.colors.textMuted }]}>{product.stock} {t('مخزون')}</Text>
                </View>
              </View>
            ))
          )}
        </Card>
      </View>
      </>
      )}
    </ScreenContainer>
  );
}

function ChartBar({ height, secondaryHeight, color, areaColor, delay, label }: {
  height: number; secondaryHeight: number; color: string; areaColor: string; delay: number; label: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const secondaryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, delay, useNativeDriver: true, damping: 14, stiffness: 90 }).start();
    Animated.spring(secondaryAnim, { toValue: 1, delay: delay + 40, useNativeDriver: true, damping: 14, stiffness: 90 }).start();
  }, []);

  return (
    <View style={styles.barCol}>
      <View style={styles.barStack}>
        <Animated.View
          style={[
            styles.barSecondary,
            {
              backgroundColor: color,
              opacity: 0.2,
              height: secondaryAnim.interpolate({ inputRange: [0, 1], outputRange: [2, secondaryHeight * 0.7] }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.barPrimary,
            {
              backgroundColor: color,
              height: anim.interpolate({ inputRange: [0, 1], outputRange: [2, height * 0.7] }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  greetingSub: { fontSize: 12, marginTop: 4 },
  periodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsGridCompact: {
    flexDirection: 'column',
  },
  revenueCard: { gap: 16 },
  revenueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sectionSub: { fontSize: 11, marginTop: 2, lineHeight: 16 },
  chipRow: { flexDirection: 'row', gap: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  chartContainer: { gap: 8, marginTop: 4 },
  chartArea: { height: 120, position: 'relative', justifyContent: 'flex-end' },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.5,
  },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: '100%' },
  barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end', paddingHorizontal: 2 },
  barStack: { alignItems: 'center', justifyContent: 'flex-end', gap: 3, width: '100%' },
  barPrimary: { width: 14, borderRadius: 7, minHeight: 2 },
  barSecondary: { width: 10, borderRadius: 5, minHeight: 2 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-around' },
  chartLabelText: { fontSize: 9, fontWeight: '500', flex: 1, textAlign: 'center' },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  viewAll: { fontSize: 12, fontWeight: '600' },
  twoCol: { flexDirection: 'row', gap: 12 },
  twoColCompact: { flexDirection: 'column' },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    borderTopWidth: 1,
    marginTop: 10,
  },
  orderIdCircle: { width: 38, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  orderIdText: { fontSize: 10, fontWeight: '700' },
  orderCustomer: { fontSize: 13, fontWeight: '600' },
  orderDate: { fontSize: 10, marginTop: 2 },
  orderAmount: { fontSize: 13, fontWeight: '700' },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, marginTop: 10 },
  productRank: { width: 20, alignItems: 'center' },
  rankNum: { fontSize: 11, fontWeight: '600' },
  productImg: { width: 36, height: 36, borderRadius: 9 },
  productName: { fontSize: 13, fontWeight: '600' },
  productMeta: { fontSize: 11, marginTop: 2 },
  productPrice: { fontSize: 13, fontWeight: '700' },
  productStock: { fontSize: 10, marginTop: 2 },
});
