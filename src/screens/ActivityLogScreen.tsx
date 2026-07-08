import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Button, EmptyState, Badge, SegmentedControl } from '../components/ui';
import { ActivityLog } from '../types';

const ICONS: Record<ActivityLog['type'], keyof typeof Ionicons.glyphMap> = {
  product: 'cube-outline', order: 'cart-outline', customer: 'person-outline', system: 'settings-outline',
};

const TONES: Record<ActivityLog['type'], 'accent' | 'info' | 'success' | 'neutral'> = {
  product: 'accent', order: 'info', customer: 'success', system: 'neutral',
};

export default function ActivityLogScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();

  const FILTERS = [
    { key: 'all', label: t('الكل') },
    { key: 'product', label: t('منتجات') },
    { key: 'order', label: t('طلبات') },
    { key: 'customer', label: t('عملاء') },
    { key: 'system', label: t('نظام') },
  ];
  const { state, clearLogs } = useStore();
  const [filter, setFilter] = useState('all');

  const logs = filter === 'all' ? state.activityLogs : state.activityLogs.filter((l) => l.type === filter);

  return (
    <ScreenContainer>
      <Button variant="danger" label={t('مسح السجل')} onPress={clearLogs} icon="trash-outline" iconPosition="right" />

      <SegmentedControl options={FILTERS} selected={filter} onSelect={setFilter} />

      {logs.length === 0 ? (
        <EmptyState icon="time-outline" title={t('لا توجد نشاطات')}         subtitle={t('لم يتم تسجيل أي أحداث بعد')} />
      ) : (
        logs.map((log) => (
          <Card key={log.id} style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Ionicons name={ICONS[log.type]} size={16} color={theme.colors.textPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{log.title}</Text>
                <Badge label={log.type} tone={TONES[log.type]} size="sm" />
              </View>
              <Text style={[styles.desc, { color: theme.colors.textMuted }]}>{log.description}</Text>
              <Text style={[styles.time, { color: theme.colors.textMuted }]}>{log.time}</Text>
            </View>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 13, fontWeight: '600' },
  desc: { fontSize: 11, marginTop: 4, lineHeight: 16 },
  time: { fontSize: 10, marginTop: 4 },
});
