import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

/** Every screen renders through this so spacing/background stay consistent app-wide. */
export default function ScreenContainer({ children, scroll = true, style }: Props) {
  const { theme } = useTheme();
  const content = (
    <View style={[styles.content, { backgroundColor: theme.colors.background }, style]}>{children}</View>
  );

  if (!scroll) return content;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
