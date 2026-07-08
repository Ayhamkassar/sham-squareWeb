import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export default function Skeleton({ width = '100%', height = 16, radius = 6, style }: Props) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          width: width as any,
          height,
          borderRadius: radius,
          backgroundColor: theme.colors.surfaceAlt,
          opacity,
        },
      ]}
    />
  );
}

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]}>
      <Skeleton width="40%" height={14} />
      <View style={{ height: 10 }} />
      <Skeleton width="80%" height={12} />
      <View style={{ height: 6 }} />
      <Skeleton width="60%" height={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
});
