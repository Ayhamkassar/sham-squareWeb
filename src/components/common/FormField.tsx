import React from 'react';
import { StyleSheet, Text, TextInput, View, KeyboardTypeOptions } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  secureTextEntry?: boolean;
}

export default function FormField({ label, value, onChangeText, placeholder, keyboardType, multiline, secureTextEntry }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          {
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: theme.colors.border,
            height: multiline ? 90 : 44,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 12, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    textAlign: 'right',
  },
});
