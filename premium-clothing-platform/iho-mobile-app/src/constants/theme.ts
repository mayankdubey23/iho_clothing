/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// Premium Fashion Brand Colors
export const PremiumColors = {
  primary: '#071327', // Dark Navy
  accent: '#F15A3D', // Warm Orange/Coral
  text: '#FFFFFF', // White
  secondary: '#A0AEC0', // Soft Grey
  dark: '#0A1B2E', // Darker Navy
  light: '#F8FAFC', // Off-white
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;

export const Colors = {
  light: {
    text: PremiumColors.text,
    background: PremiumColors.primary,
    backgroundElement: PremiumColors.dark,
    backgroundSelected: PremiumColors.accent,
    textSecondary: PremiumColors.secondary,
    primary: PremiumColors.primary,
    accent: PremiumColors.accent,
  },
  dark: {
    text: PremiumColors.text,
    background: PremiumColors.primary,
    backgroundElement: PremiumColors.dark,
    backgroundSelected: PremiumColors.accent,
    textSecondary: PremiumColors.secondary,
    primary: PremiumColors.primary,
    accent: PremiumColors.accent,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Typography System
export const FontFamilies = {
  // Heading Fonts
  headingPrimary: 'BebasNeue', // Bold impact headings
  headingSecondary: 'Anton', // Alternative bold
  headingTertiary: 'Oswald', // Condensed headings

  // Body Fonts
  bodyPrimary: 'Inter', // Clean, readable body text
  bodySecondary: 'PlusJakartaSans', // Alternative body

  // Fallback for all
  sans: 'system-ui',
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const FontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const AnimationDurations = {
  micro: 150,
  fast: 250,
  base: 350,
  slow: 500,
  slower: 750,
  slowest: 1000,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
