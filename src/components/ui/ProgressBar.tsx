import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  value: number;
  color?: string;
  height?: number;
  animated?: boolean;
  showTrack?: boolean;
  style?: ViewStyle;
}

export default function ProgressBar({ value, color, height = 5, animated = true, showTrack = true, style }: Props) {
  const { theme } = useTheme();
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(widthAnim, { toValue: value, duration: 800, useNativeDriver: false }).start();
    } else {
      widthAnim.setValue(value);
    }
  }, [value, animated]);

  const barColor = color || theme.colors.accent;
  const clampedValue = Math.min(100, Math.max(0, value));
  const trackH = Math.max(height, 3);

  return (
    <View
      style={[
        showTrack && { backgroundColor: theme.colors.surfaceAlt },
        {
          height: trackH,
          borderRadius: trackH / 2,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          height: trackH,
          backgroundColor: barColor,
          borderRadius: trackH / 2,
          width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) as any,
        }}
      />
    </View>
  );
}
