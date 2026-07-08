import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';

interface Props {
  label: string;
  tone?: BadgeTone;
  variant?: 'solid' | 'light' | 'dot';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export default function Badge({ label, tone = 'neutral', variant = 'light', size = 'md', style }: Props) {
  const { theme } = useTheme();

  const toneMap: Record<BadgeTone, { solid: string; light: string; text: string }> = {
    success: { solid: theme.colors.success, light: theme.colors.successLight, text: theme.colors.success },
    warning: { solid: theme.colors.warning, light: theme.colors.warningLight, text: theme.colors.warning },
    danger: { solid: theme.colors.danger, light: theme.colors.dangerLight, text: theme.colors.danger },
    info: { solid: theme.colors.info, light: theme.colors.infoLight, text: theme.colors.info },
    neutral: { solid: theme.colors.textMuted, light: theme.colors.surfaceAlt, text: theme.colors.textSecondary },
    accent: { solid: theme.colors.accent, light: theme.colors.accentLight, text: theme.colors.accent },
  };

  const t = toneMap[tone];

  if (variant === 'dot') {
    return (
      <View style={[styles.dotRow, style]}>
        <View style={[styles.dot, { backgroundColor: t.solid }]} />
        <Text style={{ fontSize: size === 'sm' ? 10 : 11, color: t.text }}>{label}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variant === 'solid' ? t.solid : t.light,
          paddingHorizontal: size === 'sm' ? 8 : 10,
          paddingVertical: size === 'sm' ? 3 : 5,
          borderRadius: theme.radius.sm,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: size === 'sm' ? 10 : 11,
          color: variant === 'solid' ? '#ffffff' : t.text,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
