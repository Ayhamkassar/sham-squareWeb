import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, Avatar, StatCard, Divider } from '../components/ui';
import { formatCurrency } from '../utils/formatters';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerDetails'>;

export default function CustomerDetailsScreen({ route }: Props) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state } = useStore();

  const customer = state.customers.find((c) => c.id === route.params.customer.id) ?? route.params.customer;

  return (
    <ScreenContainer>
      {/* Profile Header */}
      <Card>
        <View style={styles.profileHeader}>
          <Avatar uri={customer.avatar} name={customer.name} size={72} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{customer.name}</Text>
            <Badge label={customer.status} tone={customer.status === 'Loyal' ? 'info' : customer.status === 'Active' ? 'success' : 'neutral'} />
          </View>
        </View>
      </Card>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard icon="receipt-outline" label={t('الطلبات')} value={String(customer.totalOrders)} color={theme.colors.accent} />
        <StatCard icon="cash-outline" label={t('القيمة الدائمة')} value={formatCurrency(customer.lifetimeValue)} color={theme.colors.success} />
      </View>

      {/* Contact Info */}
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('معلومات الاتصال')}</Text>
        <Divider style={{ marginVertical: 10 }} />
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name="call-outline" size={15} color={theme.colors.textMuted} />
          </View>
          <Text style={[styles.infoText, { color: theme.colors.textPrimary }]}>{customer.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name="mail-outline" size={15} color={theme.colors.textMuted} />
          </View>
          <Text style={[styles.infoText, { color: theme.colors.textPrimary }]}>{customer.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Ionicons name="location-outline" size={15} color={theme.colors.textMuted} />
          </View>
          <Text style={[styles.infoText, { color: theme.colors.textPrimary }]}>{customer.city}</Text>
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>{t('عضو منذ')}: {customer.memberSince}</Text>
        </View>
      </Card>

      {/* Recent Orders */}
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('الطلبات الأخيرة')}</Text>
        <Divider style={{ marginVertical: 10 }} />
        {customer.recentOrders && customer.recentOrders.length > 0 ? (
          customer.recentOrders.map((o) => (
            <View key={o.id} style={[styles.orderRow, { borderColor: theme.colors.borderLight }]}>
              <View>
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '600', fontSize: 12 }}>#{o.id}</Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 10, marginTop: 2 }}>{o.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '600', fontSize: 12 }}>{o.value}</Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 10, marginTop: 2 }}>{o.status}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', paddingVertical: 20 }}>
            {t('لا توجد طلبات حالياً')}
          </Text>
        )}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileHeader: { alignItems: 'center', gap: 12 },
  name: { fontSize: 18, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  infoIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  infoText: { fontSize: 13 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 12, marginTop: 8 },
});
