import React, { useRef } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { useAuth } from '../context/AuthContext';
import { DrawerParamList } from './types';
import { Avatar } from '../components/ui';

interface NavItem {
  route: keyof DrawerParamList;
  labelAr: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const NAV_SECTIONS: { title?: string; items: NavItem[] }[] = [
  {
    items: [{ route: 'Dashboard', labelAr: 'لوحة التحكم', icon: 'grid-outline' }],
  },
  {
    title: 'المتجر',
    items: [
      { route: 'Products', labelAr: 'المنتجات', icon: 'cube-outline' },
      { route: 'Categories', labelAr: 'الفئات', icon: 'pricetag-outline' },
      { route: 'Inventory', labelAr: 'المخزون', icon: 'file-tray-stacked-outline' },
    ],
  },
  {
    title: 'المبيعات',
    items: [
      { route: 'Orders', labelAr: 'الطلبات', icon: 'cart-outline' },
      { route: 'Payments', labelAr: 'المدفوعات', icon: 'card-outline' },
      { route: 'Coupons', labelAr: 'الكوبونات', icon: 'ticket-outline' },
    ],
  },
  {
    title: 'العملاء',
    items: [
      { route: 'Customers', labelAr: 'العملاء', icon: 'people-outline' },
      { route: 'Support', labelAr: 'الدعم الفني', icon: 'headset-outline' },
      { route: 'Reviews', labelAr: 'التقييمات', icon: 'star-outline' },
    ],
  },
  {
    title: 'النظام',
    items: [
      { route: 'Notifications', labelAr: 'الإشعارات', icon: 'notifications-outline' },
      { route: 'Roles', labelAr: 'الصلاحيات', icon: 'shield-checkmark-outline' },
      { route: 'ActivityLog', labelAr: 'النشاطات', icon: 'time-outline' },
      { route: 'Settings', labelAr: 'الإعدادات', icon: 'settings-outline' },
    ],
  },
];

export default function DrawerContent(props: DrawerContentComponentProps) {
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLocale, locale } = useLocale();
  const { adminUser } = useAuth();
  const safeUser = adminUser ?? { name: '', role: '', avatar: '', email: '' } as any;
  const activeRoute = props.state.routeNames[props.state.index];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Premium Header */}
      <View style={[styles.profileSection, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.profileRow}>
          <Avatar uri={safeUser.avatar} name={safeUser.name} size={44} online />
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: theme.colors.textPrimary }]} numberOfLines={1}>
              {safeUser.name}
            </Text>
            <Text style={[styles.role, { color: theme.colors.textMuted }]} numberOfLines={1}>
              {safeUser.role}
            </Text>
          </View>
        </View>
      </View>

      {/* Navigation */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {NAV_SECTIONS.map((section, sIdx) => (
          <View key={section.title ?? "dashboard"} style={styles.section}>
            {section.title && (
              <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
                {t(section.title)}
              </Text>
            )}
            {section.items.map((item) => {
              const isActive = activeRoute === item.route;
              return (
                <Pressable
                  key={item.route}
                  onPress={() => props.navigation.navigate(item.route)}
                  style={[
                    styles.navItem,
                    isActive && { backgroundColor: theme.colors.accentLight },
                  ]}
                >
                  <View style={[styles.navIcon, isActive && { backgroundColor: theme.colors.accent }]}>
                    <Ionicons
                      name={item.icon}
                      size={16}
                      color={isActive ? theme.colors.accentText : theme.colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.navLabel,
                      { color: isActive ? theme.colors.accent : theme.colors.textSecondary },
                      isActive && { fontWeight: '600' },
                    ]}
                  >
                    {t(item.labelAr)}
                  </Text>
                  {isActive && <View style={[styles.activeBar, { backgroundColor: theme.colors.accent }]} />}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <Pressable onPress={toggleTheme} style={[styles.footerBtn, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Ionicons
            name={theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
            size={16}
            color={theme.colors.textSecondary}
          />
        </Pressable>
        <Pressable onPress={toggleLocale} style={[styles.footerBtn, { backgroundColor: theme.colors.surfaceAlt }]}>
          <Text style={{ color: theme.colors.textSecondary, fontWeight: '700', fontSize: 11 }}>
            {locale === 'ar' ? 'EN' : t('عربي')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileSection: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  name: { fontSize: 14, fontWeight: '700' },
  role: { fontSize: 11, marginTop: 2 },
  scroll: { flex: 1, paddingHorizontal: 12 },
  section: { marginTop: 8 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 2,
    position: 'relative',
  },
  navIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: { fontSize: 13, flex: 1 },
  activeBar: {
    position: 'absolute',
    right: 0,
    width: 3,
    height: 20,
    borderRadius: 1.5,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
  },
  footerBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
