import { Platform, TextStyle, ViewStyle } from 'react-native';

export type ResolvedTheme = 'light' | 'dark';

export const Palette = {
  light: {
    canvas: '#FAF7F2',
    surface: '#FFFFFF',
    surfaceMuted: '#F2ECE4',
    surfaceSelected: '#E8DFD3',
    line: '#E5DCD0',
    ink: '#1C1917',
    inkMuted: '#6B6259',
    inkSubtle: '#78706A',
    accent: '#A8482A',
    accentSoft: '#F6E3D9',
    onAccent: '#FFFFFF',
    success: '#3F7A55',
    warning: '#8A5A05',
    danger: '#B3261E',
    overlay: 'rgba(28, 25, 23, 0.35)',
  },
  dark: {
    canvas: '#16130F',
    surface: '#201C17',
    surfaceMuted: '#2A251E',
    surfaceSelected: '#342D25',
    line: '#3A332A',
    ink: '#F5F0E8',
    inkMuted: '#B3A99C',
    inkSubtle: '#9A9083',
    accent: '#E89B7A',
    accentSoft: '#3A241B',
    onAccent: '#1C1917',
    success: '#7FB894',
    warning: '#D9A441',
    danger: '#F2867D',
    overlay: 'rgba(10, 8, 6, 0.55)',
  },
} as const;

/**
 * Section 2.4: 分类图表色（Wallet）
 * 按顺序使用，保证相邻色可区分
 */
export const CategoryChartColors = {
  light: [
    '#A8482A', // 1 餐饮
    '#C98A3E', // 2 交通
    '#6E8B5A', // 3 学习
    '#5B7C8D', // 4 购物
    '#8A6A9B', // 5 娱乐
    '#B56576', // 6 日用品
    '#7A6A5A', // 7 住宿
    '#78706A', // 8 其他
  ],
  dark: [
    '#E89B7A', // 1 餐饮
    '#E5B86B', // 2 交通
    '#A3C48C', // 3 学习
    '#8FB3C4', // 4 购物
    '#B79CC6', // 5 娱乐
    '#D894A2', // 6 日用品
    '#B3A18E', // 7 住宿
    '#9A9083', // 8 其他
  ],
} as const;

export const SpacingTokens = {
  0.5: 2,
  1: 4,
  2: 8,
  3: 16,
  4: 24,
  5: 32,
  6: 48,
  8: 64,
} as const;

export const RadiusTokens = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const tabularNumsStyle: TextStyle = {
  fontVariant: ['tabular-nums'],
};

/**
 * Section 4.3: 层级表达
 * 浅色：使用 1px line 边框 + 极轻暖色阴影（rgba(60, 40, 20, 0.06)，y=2，blur=12）
 * 深色：不使用阴影，通过 canvas → surface → surface-muted 的明度递进表达层级
 */
export function getCardSurfaceStyle(theme: ResolvedTheme): ViewStyle {
  if (theme === 'dark') {
    return {
      backgroundColor: Palette.dark.surface,
      borderWidth: 0,
    };
  }
  return {
    backgroundColor: Palette.light.surface,
    borderWidth: 1,
    borderColor: Palette.light.line,
    ...Platform.select({
      ios: {
        shadowColor: '#3C2814',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 2px 12px rgba(60, 40, 20, 0.06)',
      } as unknown as ViewStyle,
    }),
  };
}
