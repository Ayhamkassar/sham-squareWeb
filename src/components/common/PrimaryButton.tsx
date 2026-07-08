import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

export default function PrimaryButton({ label, onPress, variant = 'primary', loading, disabled }: Props) {
  const { theme } = useTheme();

  const backgroundColor =
    variant === 'primary' ? theme.colors.accent : variant === 'danger' ? theme.colors.danger : 'transparent';
  const textColor = variant === 'outline' ? theme.colors.textPrimary : theme.colors.accentText;
  const borderColor = variant === 'outline' ? theme.colors.border : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor, borderColor, borderWidth: variant === 'outline' ? 1 : 0, opacity: pressed ? 0.85 : disabled ? 0.5 : 1 },
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.label, { color: textColor }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
