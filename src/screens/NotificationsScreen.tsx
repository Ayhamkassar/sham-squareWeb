import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/layout';
import { Card, Button, EmptyState, Badge } from '../components/ui';
import { StoreNotification } from '../types';

const ICONS: Record<StoreNotification['type'], keyof typeof Ionicons.glyphMap> = {
  order: 'cart-outline', inventory: 'file-tray-stacked-outline', system: 'settings-outline', shipping: 'car-outline',
};

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { state, markAllNotificationsRead, clearAllNotifications, markNotificationRead } = useStore();

  const unreadCount = state.notifications.filter((n) => n.unread).length;

  return (
    <ScreenContainer>
      <View style={styles.actionsRow}>
        <Button variant="outline" label={`${t('تحديد الكل كمقروء')} (${unreadCount})`} onPress={markAllNotificationsRead} style={{ flex: 1 }} size="sm" />
        <Button variant="danger" label={t('مسح الكل')} onPress={clearAllNotifications} style={{ flex: 1 }} size="sm" />
      </View>

      {state.notifications.length === 0 ? (
        <EmptyState icon="notifications-outline" title={t('لا توجد إشعارات')} subtitle={t('جميع الإشعارات مقروءة')} />
      ) : (
        state.notifications.map((n) => (
          <Pressable key={n.id} onPress={() => markNotificationRead(n.id)}>
            <Card style={[styles.row, n.unread && { borderColor: theme.colors.info }]}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceAlt }]}>
                <Ionicons name={ICONS[n.type]} size={18} color={theme.colors.textPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={1}>{n.title}</Text>
                  {n.unread && <View style={[styles.dot, { backgroundColor: theme.colors.info }]} />}
                </View>
                <Text style={[styles.desc, { color: theme.colors.textMuted }]} numberOfLines={2}>{n.description}</Text>
                <Text style={[styles.time, { color: theme.colors.textMuted }]}>{n.time}</Text>
              </View>
            </Card>
          </Pressable>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actionsRow: { flexDirection: 'row', gap: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 13, fontWeight: '600' },
  desc: { fontSize: 11, marginTop: 4, lineHeight: 16 },
  time: { fontSize: 10, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
