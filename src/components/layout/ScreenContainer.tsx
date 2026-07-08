import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  padded?: boolean;
}

export default function ScreenContainer({ children, scroll = true, style, padded = true }: Props) {
  const { theme } = useTheme();
  const content = (
    <View
      style={[
        styles.content,
        { backgroundColor: theme.colors.background },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!scroll) return content;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background, flex: 1 }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, minHeight: '100%' },
  padded: { padding: 16, gap: 14 },
  scrollContent: { paddingBottom: 40 },
});
