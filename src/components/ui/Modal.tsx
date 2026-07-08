import React, { useRef, useEffect } from 'react';
import { Animated, Dimensions, Modal as RNModal, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  style?: ViewStyle;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Modal({ visible, title, onClose, children, size = 'md', style }: Props) {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const sizeMap = {
    sm: { maxWidth: '80%', px: 20 },
    md: { maxWidth: '92%', px: 24 },
    lg: { maxWidth: '96%', px: 28 },
    full: { maxWidth: '100%', px: 20, margin: 0, borderRadius: 0 },
  };

  const s = sizeMap[size];

  return (
    <RNModal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[styles.overlay, { backgroundColor: theme.colors.overlay, opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              transform: [{ translateY: slideAnim }],
              maxWidth: s.maxWidth as any,
              paddingHorizontal: s.px as number,
              borderRadius: theme.radius.xxxxl,
            },
            style,
          ]}
        >
          <View style={[styles.header, { borderBottomColor: theme.colors.borderLight }]}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12} style={[styles.closeBtn, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Ionicons name="close" size={16} color={theme.colors.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.body}>{children}</View>
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxHeight: '80%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: '700' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { gap: 16, paddingTop: 8 },
});
