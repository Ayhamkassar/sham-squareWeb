import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../theme/ThemeContext';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'warning',
  info: 'information-circle',
};

const COLORS: Record<string, string> = {
  success: '#22c55e',
  error: '#ef4444',
  info: '#3b82f6',
};

export default function ToastBanner() {
  const { toast } = useToast();
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast.visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 15, stiffness: 200 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -100, duration: 200, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [toast.visible]);

  if (!toast.visible) return null;

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.colors.surface,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          borderColor: COLORS[toast.type],
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.iconWrap, { backgroundColor: `${COLORS[toast.type]}14` }]}>
        <Ionicons name={ICONS[toast.type]} size={16} color={COLORS[toast.type]} />
      </View>
      <Text style={[styles.text, { color: theme.colors.textPrimary }]} numberOfLines={2}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    maxWidth: '90%',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 999,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});
