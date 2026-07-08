import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, TextInput, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export default function SearchBar({ value, onChangeText, placeholder }: Props) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    if (!value) {
      Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.accent],
  });

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.colors.surface,
          borderColor: borderColor as any,
        },
      ]}
    >
      <Ionicons
        name="search-outline"
        size={18}
        color={focused ? theme.colors.accent : theme.colors.textMuted}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[styles.input, { color: theme.colors.textPrimary }]}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 46,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
});
