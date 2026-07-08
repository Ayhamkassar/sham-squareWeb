import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from './';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceAlt }]}>
        <Ionicons name={icon} size={28} color={theme.colors.textMuted} />
      </View>
      <Text style={[styles.title, { color: theme.colors.textSecondary }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} variant="outline" size="sm" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 56,
    gap: 12,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 15, fontWeight: '600' },
  subtitle: { fontSize: 12, textAlign: 'center', maxWidth: '75%', lineHeight: 18 },
});
