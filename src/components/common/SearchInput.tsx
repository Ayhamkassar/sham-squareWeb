import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export default function SearchInput({ value, onChangeText, placeholder }: Props) {
  const { theme } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Ionicons name="search" size={16} color={theme.colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, { color: theme.colors.textPrimary }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
});
