import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Badge, EmptyState, Avatar, SegmentedControl } from '../components/ui';
import { formatCurrency } from '../utils/formatters';
import { BadgeTone } from '../components/ui/Badge';
import { Transaction } from '../types';

const STATUS_TONE: Record<Transaction['status'], BadgeTone> = { success: 'success', pending: 'warning', failed: 'danger' };

export default function PaymentsScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state } = useStore();

  const STATUS_LABEL: Record<Transaction['status'], string> = useMemo(() => ({ success: t('ناجحة'), pending: t('معلقة'), failed: t('فاشلة') }), [t]);
  const FILTERS = useMemo(() => [
    { key: 'all', label: t('الكل') },
    { key: 'success', label: t('ناجحة') },
    { key: 'pending', label: t('معلقة') },
    { key: 'failed', label: t('فاشلة') },
  ], [t]);

  const [filter, setFilter] = React.useState('all');

  const txs = filter === 'all' ? state.transactions : state.transactions.filter((tx) => tx.status === filter);

  return (
    <ScreenContainer>
      <SegmentedControl options={FILTERS} selected={filter} onSelect={setFilter} />

      {txs.length === 0 ? (
        <EmptyState icon="card-outline" title={t('لا توجد معاملات')} />
      ) : (
        txs.map((tx) => (
          <Card key={tx.id} style={styles.row}>
            <Avatar name={tx.customerName} size={42} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.colors.textPrimary }]} numberOfLines={1}>{tx.customerName}</Text>
              <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{tx.date} • {tx.time}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Text style={[styles.amount, { color: theme.colors.textPrimary }]}>{formatCurrency(tx.amount)}</Text>
              <Badge label={t(STATUS_LABEL[tx.status])} tone={STATUS_TONE[tx.status]} size="sm" />
            </View>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 13, fontWeight: '600' },
  meta: { fontSize: 11, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '700' },
});
