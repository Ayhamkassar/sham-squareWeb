import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface Props {
  label: string;
  tone?: BadgeTone;
}

/** Small colored status pill. Tone maps 1:1 to a semantic color token. */
export default function Badge({ label, tone = 'neutral' }: Props) {
  const { theme } = useTheme();

  const toneColor: Record<BadgeTone, string> = {
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
    info: theme.colors.info,
    neutral: theme.colors.textSecondary,
  };

  const color = toneColor[tone];

  return (
    <View style={[styles.badge, { backgroundColor: `${color}1A`, borderColor: `${color}40` }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});
