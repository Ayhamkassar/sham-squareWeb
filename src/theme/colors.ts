export interface ColorPalette {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceAlt: string;
  surfaceElevated: string;
  border: string;
  borderLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentLight: string;
  accentText: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;
  overlay: string;
  shadow: string;
  chart: string[];
  chartArea: string[];
}

export const lightPalette: ColorPalette = {
  background: '#f4f3f8',
  backgroundAlt: '#eae8f0',
  surface: '#ffffff',
  surfaceAlt: '#f6f5fa',
  surfaceElevated: '#ffffff',
  border: '#e3e1ea',
  borderLight: '#efedf5',
  textPrimary: '#1a1826',
  textSecondary: '#6b687a',
  textMuted: '#a8a5b8',
  accent: '#6c5ce7',
  accentLight: '#eeebff',
  accentText: '#ffffff',
  success: '#0f973d',
  successLight: '#e6f7ed',
  warning: '#c4841d',
  warningLight: '#fef3e2',
  danger: '#dc2626',
  dangerLight: '#fee7e7',
  info: '#2563eb',
  infoLight: '#e8f0fe',
  overlay: 'rgba(26, 24, 38, 0.45)',
  shadow: 'rgba(26, 24, 38, 0.07)',
  chart: ['#6c5ce7', '#0f973d', '#c4841d', '#2563eb', '#dc2626', '#a8a5b8'],
  chartArea: ['rgba(108, 92, 231, 0.12)', 'rgba(15, 151, 61, 0.12)', 'rgba(196, 132, 29, 0.12)', 'rgba(37, 99, 235, 0.12)'],
};

export const darkPalette: ColorPalette = {
  background: '#0c0b12',
  backgroundAlt: '#15141d',
  surface: '#14131b',
  surfaceAlt: '#1d1c28',
  surfaceElevated: '#1c1b27',
  border: '#292735',
  borderLight: '#232230',
  textPrimary: '#eeeef5',
  textSecondary: '#a09eb3',
  textMuted: '#6b697d',
  accent: '#8b5cf6',
  accentLight: '#1e1a40',
  accentText: '#ffffff',
  success: '#22c55e',
  successLight: '#0a2e1a',
  warning: '#eab308',
  warningLight: '#2e260a',
  danger: '#ef4444',
  dangerLight: '#2e0a0a',
  info: '#3b82f6',
  infoLight: '#0a1a2e',
  overlay: 'rgba(0, 0, 0, 0.65)',
  shadow: 'rgba(0, 0, 0, 0.35)',
  chart: ['#8b5cf6', '#22c55e', '#eab308', '#3b82f6', '#ef4444', '#6b697d'],
  chartArea: ['rgba(139, 92, 246, 0.15)', 'rgba(34, 197, 94, 0.15)', 'rgba(234, 179, 8, 0.15)', 'rgba(59, 130, 246, 0.15)'],
};
