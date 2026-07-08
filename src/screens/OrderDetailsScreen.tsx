import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, Divider } from '../components/ui';
import { formatCurrency } from '../utils/formatters';
import { RootStackParamList } from '../navigation/types';
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from './orderStatus';
import { Order } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;

export default function OrderDetailsScreen({ route }: Props) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, updateOrderStatus } = useStore();

  const order: Order = state.orders.find((o) => o.id === route.params.order.id) ?? route.params.order;

  return (
    <ScreenContainer>
      {/* Order Header */}
      <Card>
        <View style={styles.rowBetween}>
          <View>
            <Text style={[styles.orderId, { color: theme.colors.textPrimary }]}>#{order.id}</Text>
            <Text style={[styles.date, { color: theme.colors.textMuted }]}>{order.date}</Text>
          </View>
          <Badge label={t(ORDER_STATUS_LABEL[order.status])} tone={ORDER_STATUS_TONE[order.status]} />
        </View>
      </Card>

      {/* Customer Info */}
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('معلومات العميل')}</Text>
        <View style={{ height: 12 }} />
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name="person-outline" size={15} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.infoText, { color: theme.colors.textPrimary }]}>{order.customerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name="call-outline" size={15} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.infoText, { color: theme.colors.textPrimary }]}>{order.customerPhone}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name="location-outline" size={15} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary, flex: 1 }]} numberOfLines={2}>{order.customerAddress}</Text>
        </View>
      </Card>

      {/* Order Items */}
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('المنتجات')}</Text>
        <View style={{ height: 12 }} />
        {order.items.map((item, idx) => (
          <View key={`${item.productId}-${idx}`} style={[styles.itemRow, { borderColor: theme.colors.borderLight }]}>
            <Image source={{ uri: item.productImage }} style={styles.itemImage} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.productName}</Text>
              <Text style={[styles.itemQty, { color: theme.colors.textMuted }]}>x{item.quantity} • {formatCurrency(item.price)}</Text>
            </View>
            <Text style={[styles.itemTotal, { color: theme.colors.textPrimary }]}>{formatCurrency(item.price * item.quantity)}</Text>
          </View>
        ))}
        <Divider style={{ marginVertical: 10 }} />
        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>{t('المجموع الفرعي')}</Text>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 13 }}>{formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>{t('الشحن')}</Text>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 13 }}>{formatCurrency(order.shipping)}</Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>{t('الخصم')}</Text>
              <Text style={{ color: theme.colors.success, fontSize: 13 }}>-{formatCurrency(order.discount)}</Text>
            </View>
          )}
          <Divider style={{ marginVertical: 4 }} />
          <View style={styles.totalsRow}>
            <Text style={[styles.grandTotal, { color: theme.colors.textPrimary }]}>{t('الإجمالي')}</Text>
            <Text style={[styles.grandTotal, { color: theme.colors.textPrimary }]}>{formatCurrency(order.total)}</Text>
          </View>
        </View>
      </Card>

      {/* Status Update */}
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('تحديث حالة الطلب')}</Text>
        <View style={{ height: 10 }} />
        <View style={styles.statusGrid}>
          {ORDER_STATUS_FLOW.map((status) => {
            const active = status === order.status;
            return (
              <Pressable
                key={status}
                onPress={() => updateOrderStatus(order.id, status)}
                style={[
                  styles.statusBtn,
                  {
                    backgroundColor: active ? theme.colors.accent : theme.colors.surfaceAlt,
                    borderColor: active ? theme.colors.accent : theme.colors.border,
                    borderRadius: theme.radius.md,
                  },
                ]}
              >
                <Text style={{
                  color: active ? theme.colors.accentText : theme.colors.textSecondary,
                  fontSize: 11,
                  fontWeight: '600',
                }}>
                  {t(ORDER_STATUS_LABEL[status])}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Tracking Timeline */}
      {order.trackingTimeline.length > 0 && (
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('تتبع الشحنة')}</Text>
          <View style={{ height: 12 }} />
          {order.trackingTimeline.map((step, idx) => {
            const isLast = idx === order.trackingTimeline.length - 1;
            return (
              <View key={idx} style={[styles.timelineRow, !isLast && { borderColor: theme.colors.borderLight }]}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: step.active ? theme.colors.success : theme.colors.border }]}>
                    {step.active && <Ionicons name="checkmark" size={10} color="#fff" />}
                  </View>
                  {!isLast && <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} />}
                </View>
                <View style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
                  <Text style={{ color: theme.colors.textPrimary, fontSize: 12, fontWeight: '600' }}>{step.status}</Text>
                  <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 2 }}>{step.description}</Text>
                  <Text style={{ color: theme.colors.textMuted, fontSize: 10, marginTop: 2 }}>{step.time}</Text>
                </View>
              </View>
            );
          })}
        </Card>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 18, fontWeight: '700' },
  date: { fontSize: 11, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  infoIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  infoText: { fontSize: 13 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, paddingTop: 12, marginTop: 8 },
  itemImage: { width: 44, height: 44, borderRadius: 10 },
  itemName: { fontSize: 13, fontWeight: '600' },
  itemQty: { fontSize: 11, marginTop: 2 },
  itemTotal: { fontSize: 13, fontWeight: '700' },
  totalsBlock: { gap: 8 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13 },
  grandTotal: { fontSize: 16, fontWeight: '700' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 },
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineLeft: { alignItems: 'center', width: 20 },
  timelineDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 2, flex: 1, marginTop: 4 },
});
