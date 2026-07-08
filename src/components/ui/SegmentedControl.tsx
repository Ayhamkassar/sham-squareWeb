import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Option {
  key: string;
  label: string;
}

interface Props {
  options: Option[];
  selected: string;
  onSelect: (key: string) => void;
  style?: ViewStyle;
}

export default function SegmentedControl({ options, selected, onSelect, style }: Props) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {options.map((option) => {
        const active = option.key === selected;
        return (
          <Pressable
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={[
              styles.option,
              {
                backgroundColor: active ? theme.colors.accent : theme.colors.surface,
                borderColor: active ? theme.colors.accent : theme.colors.border,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <Text
              style={{
                color: active ? theme.colors.accentText : theme.colors.textSecondary,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  option: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
