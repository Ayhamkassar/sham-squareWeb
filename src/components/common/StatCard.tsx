import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import Card from './Card';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
}

export default function StatCard({ icon, label, value, trend, trendPositive = true }: Props) {
  const { theme } = useTheme();

  return (
    <Card style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceAlt }]}>
        <Ionicons name={icon} size={18} color={theme.colors.textPrimary} />
      </View>
      <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      {trend && (
        <Text style={{ color: trendPositive ? theme.colors.success : theme.colors.danger, fontSize: 11, fontWeight: '700', marginTop: 4 }}>
          {trend}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    gap: 4,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
