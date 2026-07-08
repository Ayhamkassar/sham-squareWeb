import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface Props {
  label?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

const SIZE_MAP = {
  sm: { py: 8, px: 12, iconSize: 14, fs: 12, gap: 6 },
  md: { py: 11, px: 18, iconSize: 16, fs: 13, gap: 8 },
  lg: { py: 14, px: 24, iconSize: 18, fs: 14, gap: 10 },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  icon,
  iconPosition = 'left',
  fullWidth,
  style,
}: Props) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const s = SIZE_MAP[size];
  const isDisabled = disabled || loading;

  let bg: string, text: string, border: string;
  switch (variant) {
    case 'primary':
      bg = theme.colors.accent; text = theme.colors.accentText; border = 'transparent'; break;
    case 'secondary':
      bg = theme.colors.surfaceAlt; text = theme.colors.textPrimary; border = theme.colors.border; break;
    case 'ghost':
      bg = 'transparent'; text = theme.colors.textSecondary; border = 'transparent'; break;
    case 'danger':
      bg = theme.colors.danger; text = '#ffffff'; border = 'transparent'; break;
    case 'outline':
      bg = 'transparent'; text = theme.colors.accent; border = theme.colors.accent; break;
    default:
      bg = theme.colors.accent; text = theme.colors.accentText; border = 'transparent';
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start()}
      onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start()}
      android_ripple={{ color: 'rgba(255,255,255,0.12)', borderless: false }}
      style={[fullWidth && { width: '100%' }]}
    >
      <Animated.View
        style={[
          styles.btn,
          {
            backgroundColor: bg,
            borderColor: border,
            borderWidth: variant === 'outline' ? 1.5 : 0,
            paddingVertical: s.py,
            paddingHorizontal: s.px,
            gap: s.gap,
            opacity: isDisabled ? 0.4 : 1,
            borderRadius: theme.radius.lg,
            transform: [{ scale: scaleAnim }],
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={text} />
        ) : (
          <>
            {icon && iconPosition === 'left' && <Ionicons name={icon} size={s.iconSize} color={text} />}
            {label && <Text style={[styles.label, { color: text, fontSize: s.fs }]}>{label}</Text>}
            {icon && iconPosition === 'right' && <Ionicons name={icon} size={s.iconSize} color={text} />}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontWeight: '600' },
});
