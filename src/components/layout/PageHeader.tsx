import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface Breadcrumb {
  label: string;
}

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  style?: ViewStyle;
}

export default function PageHeader({ title, subtitle, breadcrumbs, actions, style }: Props) {
  const { theme } = useTheme();
  return (
    <View style={[styles.wrap, style]}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <View style={styles.breadcrumbs}>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <Text style={[styles.breadcrumb, { color: theme.colors.textMuted }]}>{crumb.label}</Text>
              {idx < breadcrumbs.length - 1 && (
                <Ionicons name="chevron-forward" size={12} color={theme.colors.textMuted} />
              )}
            </React.Fragment>
          ))}
        </View>
      )}
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>}
        </View>
        {actions && <View style={styles.actions}>{actions}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 4 },
  breadcrumbs: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  breadcrumb: { fontSize: 11, fontWeight: '500' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 8 },
});
