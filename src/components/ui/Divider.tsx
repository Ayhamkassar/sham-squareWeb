import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  style?: ViewStyle;
  label?: string;
}

export default function Divider({ style, label }: Props) {
  const { theme } = useTheme();
  return (
    <View style={[styles.divider, { backgroundColor: theme.colors.border }, style]} />
  );
}

const styles = StyleSheet.create({
  divider: { height: 1, width: '100%' },
});
