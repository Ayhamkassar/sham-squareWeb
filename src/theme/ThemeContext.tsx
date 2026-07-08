import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { ColorPalette, darkPalette, lightPalette } from './colors';
import { spacing, radius, fontSize, fontWeight, lineHeight, shadow } from './tokens';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: ColorPalette;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  lineHeight: typeof lineHeight;
  shadow: typeof shadow;
}

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function buildTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: mode === 'dark' ? darkPalette : lightPalette,
    spacing,
    radius,
    fontSize,
    fontWeight,
    lineHeight,
    shadow,
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: buildTheme(mode),
      toggleTheme: () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
