import React, { useState, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
  multiline?: boolean;
  secureTextEntry?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  icon,
  keyboardType,
  multiline,
  secureTextEntry,
  disabled,
  style,
}: Props) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(secureTextEntry);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    if (!error) {
      Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  };

  const hasError = !!error;
  const isFloating = focused || value.length > 0;

  const borderColor = hasError
    ? theme.colors.danger
    : borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.border, theme.colors.accent],
      });

  return (
    <View style={[styles.wrap, style]}>
      <Animated.View
        style={[
          styles.inputWrap,
          {
            borderColor: borderColor as any,
            backgroundColor: disabled ? theme.colors.surfaceAlt : theme.colors.surface,
            minHeight: multiline ? 110 : 54,
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={16}
            color={hasError ? theme.colors.danger : focused ? theme.colors.accent : theme.colors.textMuted}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={isFloating ? placeholder : ''}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType={keyboardType}
          multiline={multiline}
          secureTextEntry={secure}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              textAlignVertical: multiline ? 'top' : 'center',
              paddingTop: multiline ? 22 : 0,
              paddingLeft: icon ? 36 : 12,
              paddingRight: secureTextEntry ? 36 : 12,
              minHeight: multiline ? 90 : 54,
            },
          ]}
        />
        {/* Floating label */}
        <Text
          style={[
            styles.label,
            {
              left: icon ? 36 : 12,
              color: hasError ? theme.colors.danger : focused ? theme.colors.accent : theme.colors.textMuted,
              fontSize: isFloating ? 10 : 13,
              top: isFloating ? (multiline ? 8 : 6) : multiline ? 16 : 18,
            },
          ]}
        >
          {label}
        </Text>
        {secureTextEntry && (
          <Pressable
            onPress={() => setSecure((v) => !v)}
            style={styles.eyeBtn}
            hitSlop={8}
          >
            <Ionicons
              name={secure ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={theme.colors.textMuted}
            />
          </Pressable>
        )}
      </Animated.View>
      {(hasError || hint) && (
        <View style={styles.footerRow}>
          {hasError && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={12} color={theme.colors.danger} />
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
            </View>
          )}
          {!hasError && hint && (
            <Text style={[styles.hintText, { color: theme.colors.textMuted }]}>{hint}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  inputWrap: {
    borderWidth: 1.5,
    borderRadius: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    top: 19,
    zIndex: 2,
  },
  label: {
    position: 'absolute',
    fontWeight: '500',
    zIndex: 1,
    paddingHorizontal: 2,
  },
  input: {
    fontSize: 14,
    fontWeight: '400',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
    minHeight: 16,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '500',
  },
  hintText: {
    fontSize: 11,
  },
});
