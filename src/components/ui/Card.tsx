import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  padded?: boolean;
  hoverable?: boolean;
  onPress?: () => void;
}

export default function Card({ children, style, variant = 'default', padded = true, hoverable, onPress }: Props) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const v = {
    default: { bg: theme.colors.surface, border: theme.colors.border, bw: 1 },
    elevated: { bg: theme.colors.surface, border: 'transparent', bw: 0 },
    outlined: { bg: 'transparent', border: theme.colors.border, bw: 1 },
  }[variant];

  const content = (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          borderWidth: v.bw,
          padding: padded ? theme.spacing.lg : 0,
          borderRadius: theme.radius.xxl,
          shadowColor: theme.colors.shadow,
          transform: hoverable ? [{ scale: scaleAnim }] : [],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.99, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
});
