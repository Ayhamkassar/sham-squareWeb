import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import Card from './Card';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export default function StatCard({ icon, label, value, trend, trendPositive = true, color, style }: Props) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const countAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(countAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
    ]).start();
  }, []);

  const accentColor = color || theme.colors.accent;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1, minWidth: 160 }}>
      <Card style={[styles.card, style]}>
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: `${accentColor}14` }]}>
            <Ionicons name={icon} size={18} color={accentColor} />
          </View>
          {trend && (
            <View style={[styles.trendBadge, { backgroundColor: trendPositive ? theme.colors.successLight : theme.colors.dangerLight }]}>
              <Ionicons
                name={trendPositive ? 'arrow-up' : 'arrow-down'}
                size={10}
                color={trendPositive ? theme.colors.success : theme.colors.danger}
              />
              <Text style={[styles.trendText, { color: trendPositive ? theme.colors.success : theme.colors.danger }]}>
                {trend}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{value}</Text>
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
        <View style={[styles.sparkline, { backgroundColor: theme.colors.surfaceAlt }]}>
          <View style={[styles.sparkFill, { width: `${Math.min(100, Math.random() * 50 + 30)}%`, backgroundColor: accentColor }]} />
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  trendText: { fontSize: 10, fontWeight: '600' },
  value: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  label: { fontSize: 12, fontWeight: '500' },
  sparkline: { height: 3, borderRadius: 2, marginTop: 4, overflow: 'hidden' },
  sparkFill: { height: '100%', borderRadius: 2 },
});
