import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  uri?: string;
  name: string;
  size?: number;
  online?: boolean;
  style?: ViewStyle;
}

export default function Avatar({ uri, name, size = 40, online, style }: Props) {
  const { theme } = useTheme();
  const initial = name.charAt(0);
  const radius = size / 2;
  const dotSize = size * 0.28;

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      {uri ? (
        <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: radius }]} />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: theme.colors.accentLight,
            },
          ]}
        >
          <Text style={[styles.initial, { color: theme.colors.accent, fontSize: size * 0.4 }]}>{initial}</Text>
        </View>
      )}
      {online !== undefined && (
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: online ? theme.colors.success : theme.colors.textMuted,
              borderWidth: 2,
              borderColor: theme.colors.surface,
              right: -1,
              bottom: -1,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  image: {},
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initial: { fontWeight: '700' },
  dot: { position: 'absolute' },
});
