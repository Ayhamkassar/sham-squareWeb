import React, { useRef, useMemo, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useLocale } from '../../i18n/LocaleContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui';

export const SIDEBAR_EXPANDED = 240;
export const SIDEBAR_COLLAPSED = 68;

/**
 * Toggle flags for temporarily hidden sections.
 * Flip to `true` to re-enable the section in the sidebar.
 */
export const SHOW_PAYMENTS = false;

interface NavItem {
  route: string;
  labelAr: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// Legacy static nav — not used at runtime but kept for reference.
const STATIC_NAV: { title?: string; items: NavItem[] }[] = [];

interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  forceShow?: boolean;
}

export default function Sidebar({ activeRoute, onNavigate, collapsed, onToggle, forceShow }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLocale, locale } = useLocale();
  const { adminUser, isSuperAdmin, logout } = useAuth();
  const safeUser = adminUser ?? { name: '', role: '', avatar: '', email: '' } as any;
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const NAV_SECTIONS = useMemo(() => {
    const sections: { title?: string; items: NavItem[] }[] = [
      {
        items: [{ route: 'Dashboard', labelAr: 'لوحة التحكم', icon: 'grid-outline' }],
      },
      {
        title: 'المتجر',
        items: [
          { route: 'Products', labelAr: 'المنتجات', icon: 'cube-outline' },
          { route: 'Categories', labelAr: 'الفئات', icon: 'pricetag-outline' },
          { route: 'SubCategories', labelAr: 'التصنيفات الفرعية', icon: 'layers-outline' },
          { route: 'Inventory', labelAr: 'المخزون', icon: 'file-tray-stacked-outline' },
        ],
      },
      {
        title: 'المبيعات',
        items: [
          { route: 'Orders', labelAr: 'الطلبات', icon: 'cart-outline' },
          ...(SHOW_PAYMENTS ? [{ route: 'Payments', labelAr: 'المدفوعات والمعاملات', icon: 'card-outline' } as NavItem] : []),
          { route: 'Coupons', labelAr: 'الكوبونات والخصومات', icon: 'ticket-outline' },
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
          ...(isSuperAdmin ? [
            { route: 'DepartmentManagement', labelAr: 'الأقسام', icon: 'layers-outline' } as NavItem,
            { route: 'DepartmentAdminManagement', labelAr: 'مشرفي الأقسام', icon: 'people-outline' } as NavItem,
          ] : []),
          { route: 'Notifications', labelAr: 'الإشعارات', icon: 'notifications-outline' },
          { route: 'Roles', labelAr: 'الصلاحيات', icon: 'shield-checkmark-outline' },
          { route: 'ActivityLog', labelAr: 'النشاطات', icon: 'time-outline' },
          { route: 'Settings', labelAr: 'الإعدادات', icon: 'settings-outline' },
        ],
      },
    ];
    return sections;
  }, [isSuperAdmin]);

  const animWidth = useRef(new Animated.Value(collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED)).current;

  React.useEffect(() => {
    Animated.timing(animWidth, {
      toValue: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [collapsed]);

  if (isMobile && !forceShow) return null;

  return (
    <Animated.View
    pointerEvents="box-none"
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRightColor: theme.colors.border,
          width: animWidth,
        },
      ]}
    >
      {/* Toggle button */}
      <Pressable
        onPress={onToggle}
        style={[styles.toggleBtn, { backgroundColor: theme.colors.surfaceAlt }]}
        accessibilityLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Ionicons
          name={collapsed ? 'chevron-forward' : 'chevron-back'}
          size={14}
          color={theme.colors.textSecondary}
        />
      </Pressable>

      {/* Profile */}
      <View style={[styles.profileSection, { borderBottomColor: theme.colors.border }]}>
        <Pressable
          style={styles.profileRow}
          onPress={() => onNavigate('Settings')}
        >
          <Avatar uri={safeUser.avatar} name={safeUser.name} size={32} online />
          {!collapsed && (
            <Animated.View  style={{ flex: 1, opacity: collapsed ? 0 : 1 }}>
              <Text style={[styles.name, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {safeUser.name}
              </Text>
              <Text style={[styles.role, { color: theme.colors.textMuted }]} numberOfLines={1}>
                {safeUser.role}
              </Text>
            </Animated.View>
          )}
        </Pressable>
      </View>

      {/* Navigation */}
      <ScrollView
    style={styles.scroll}
    contentContainerStyle={{
        paddingTop: 12,
        paddingBottom: 20,
    }}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
>
        {NAV_SECTIONS.map((section, sIdx) => (
          <View key={section.title ?? "dashboard"} style={styles.section}>
            {section.title && !collapsed && (
              <Animated.Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.textMuted, opacity: collapsed ? 0 : 1 },
                ]}
              >
                {t(section.title)}
              </Animated.Text>
            )}
            {section.items.map((item) => {
              const isActive = activeRoute === item.route;
              return (
                <Pressable
                  key={item.route}
                  onPress={() => onNavigate(item.route)}
                  style={[
                    styles.navItem,
                    collapsed && styles.navItemCollapsed,
                    isActive && { backgroundColor: theme.colors.accentLight },
                  ]}
                >
                  <View
                    style={[
                      styles.navIcon,
                      isActive && { backgroundColor: theme.colors.accent },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={16}
                      color={isActive ? theme.colors.accentText : theme.colors.textSecondary}
                    />
                  </View>
                  {!collapsed && (
                    <Animated.Text
                      style={[
                        styles.navLabel,
                        {
                          color: isActive ? theme.colors.accent : theme.colors.textSecondary,
                          opacity: collapsed ? 0 : 1,
                        },
                        isActive && { fontWeight: '600' },
                      ]}
                    >
                      {t(item.labelAr)}
                    </Animated.Text>
                  )}
                  {isActive && (
                    <View
                      style={[
                        styles.activeBar,
                        { backgroundColor: theme.colors.accent },
                        collapsed && styles.activeBarCollapsed,
                      ]}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <Pressable
          onPress={toggleTheme}
          style={[styles.footerBtn, { backgroundColor: theme.colors.surfaceAlt }]}
        >
          <Ionicons
            name={theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
            size={14}
            color={theme.colors.textSecondary}
          />
        </Pressable>
        <Pressable
          onPress={toggleLocale}
          style={[styles.footerBtn, { backgroundColor: theme.colors.surfaceAlt }]}
        >
          <Text style={{ color: theme.colors.textSecondary, fontWeight: '700', fontSize: 10 }}>
            {locale === 'ar' ? 'EN' : 'عربي'}
          </Text>
        </Pressable>
        {!collapsed && (
          <Pressable
            onPress={() => Alert.alert(t('تأكيد تسجيل الخروج'), t('هل أنت متأكد من تسجيل الخروج؟'), [
              { text: t('إلغاء'), style: 'cancel' },
              { text: t('تأكيد'), onPress: () => logout(), style: 'destructive' },
            ])}
            style={[styles.footerBtn, { backgroundColor: theme.colors.surfaceAlt }]}
          >
            <Ionicons name="log-out-outline" size={14} color={theme.colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    borderRightWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
toggleBtn: {
  position: 'absolute',
  top: 8,
  right: 8,
  width: 28,
  height: 28,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  elevation: 5,
},
  profileSection: {
    marginTop: 44,
    paddingBottom: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: { fontSize: 12, fontWeight: '700' },
  role: { fontSize: 10, marginTop: 1 },
  scroll: { flex: 1, paddingHorizontal: 8 },
  section: { marginTop: 4 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 1,
    position: 'relative',
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  navIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  navLabel: { fontSize: 12, flex: 1 },
  activeBar: {
    position: 'absolute',
    right: 0,
    width: 3,
    height: 16,
    borderRadius: 1.5,
  },
  activeBarCollapsed: {
    right: -8,
  },
  footer: {
    flexDirection: 'row',
    gap: 4,
    padding: 8,
    borderTopWidth: 1,
  },
  footerBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
