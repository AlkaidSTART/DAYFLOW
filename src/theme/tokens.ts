import { Platform, TextStyle, ViewStyle } from 'react-native';

export type ResolvedTheme = 'light' | 'dark';

export type ColorSchemeId =
  | 'chatgpt-emerald'
  | 'warm-clay'
  | 'chatgpt-monochrome'
  | 'ocean-breeze'
  | 'sage-forest'
  | 'iris-violet'
  | 'amber-glow';

export interface ThemePalette {
  canvas: string;
  surface: string;
  surfaceMuted: string;
  surfaceSelected: string;
  line: string;
  ink: string;
  inkMuted: string;
  inkSubtle: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
}

export interface ColorSchemeItem {
  id: ColorSchemeId;
  accentColor: string;
  previewColors: {
    canvas: string;
    surface: string;
    accent: string;
  };
  light: ThemePalette;
  dark: ThemePalette;
  chartColors: {
    light: readonly string[];
    dark: readonly string[];
  };
}

export const ColorSchemes: Record<ColorSchemeId, ColorSchemeItem> = {
  'chatgpt-emerald': {
    id: 'chatgpt-emerald',
    accentColor: '#10A37F',
    previewColors: {
      canvas: '#F7F7F8',
      surface: '#FFFFFF',
      accent: '#10A37F',
    },
    light: {
      canvas: '#F7F7F8',
      surface: '#FFFFFF',
      surfaceMuted: '#ECECF1',
      surfaceSelected: '#E3E5E8',
      line: '#E5E7EB',
      ink: '#0D0D0D',
      inkMuted: '#5D5D68',
      inkSubtle: '#8E8EA0',
      accent: '#10A37F',
      accentSoft: '#E6F7F2',
      onAccent: '#FFFFFF',
      success: '#10A37F',
      warning: '#D97706',
      danger: '#DC2626',
      overlay: 'rgba(13, 13, 13, 0.35)',
    },
    dark: {
      canvas: '#171717',
      surface: '#212121',
      surfaceMuted: '#2C2C2C',
      surfaceSelected: '#383838',
      line: '#333333',
      ink: '#ECECF1',
      inkMuted: '#ACACBE',
      inkSubtle: '#787885',
      accent: '#19C37D',
      accentSoft: '#133529',
      onAccent: '#0A2518',
      success: '#19C37D',
      warning: '#FBBF24',
      danger: '#F87171',
      overlay: 'rgba(0, 0, 0, 0.65)',
    },
    chartColors: {
      light: [
        '#10A37F',
        '#0284C7',
        '#E58A2B',
        '#7C3AED',
        '#0D9488',
        '#EC4899',
        '#4F46E5',
        '#64748B',
      ],
      dark: [
        '#19C37D',
        '#38BDF8',
        '#FBBF24',
        '#A78BFA',
        '#2DD4BF',
        '#F472B6',
        '#818CF8',
        '#94A3B8',
      ],
    },
  },

  'warm-clay': {
    id: 'warm-clay',
    accentColor: '#A8482A',
    previewColors: {
      canvas: '#FAF7F2',
      surface: '#FFFFFF',
      accent: '#A8482A',
    },
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
    chartColors: {
      light: [
        '#A8482A',
        '#C98A3E',
        '#6E8B5A',
        '#5B7C8D',
        '#8A6A9B',
        '#B56576',
        '#7A6A5A',
        '#78706A',
      ],
      dark: [
        '#E89B7A',
        '#E5B86B',
        '#A3C48C',
        '#8FB3C4',
        '#B79CC6',
        '#D894A2',
        '#B3A18E',
        '#9A9083',
      ],
    },
  },

  'chatgpt-monochrome': {
    id: 'chatgpt-monochrome',
    accentColor: '#18181B',
    previewColors: {
      canvas: '#F9FAFB',
      surface: '#FFFFFF',
      accent: '#18181B',
    },
    light: {
      canvas: '#F9FAFB',
      surface: '#FFFFFF',
      surfaceMuted: '#F1F3F5',
      surfaceSelected: '#E5E7EB',
      line: '#E4E4E7',
      ink: '#0F172A',
      inkMuted: '#4B5563',
      inkSubtle: '#6B7280',
      accent: '#18181B',
      accentSoft: '#E4E4E7',
      onAccent: '#FFFFFF',
      success: '#15803D',
      warning: '#B45309',
      danger: '#B91C1C',
      overlay: 'rgba(15, 23, 42, 0.35)',
    },
    dark: {
      canvas: '#09090B',
      surface: '#141416',
      surfaceMuted: '#1E1E22',
      surfaceSelected: '#2A2A30',
      line: '#27272A',
      ink: '#F4F4F5',
      inkMuted: '#A1A1AA',
      inkSubtle: '#71717A',
      accent: '#FAFAFA',
      accentSoft: '#27272A',
      onAccent: '#09090B',
      success: '#4ADE80',
      warning: '#FBBF24',
      danger: '#F87171',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
    chartColors: {
      light: [
        '#18181B',
        '#52525B',
        '#71717A',
        '#2563EB',
        '#059669',
        '#D97706',
        '#7C3AED',
        '#A1A1AA',
      ],
      dark: [
        '#FAFAFA',
        '#D4D4D8',
        '#A1A1AA',
        '#60A5FA',
        '#34D399',
        '#FBBF24',
        '#A78BFA',
        '#71717A',
      ],
    },
  },

  'ocean-breeze': {
    id: 'ocean-breeze',
    accentColor: '#0284C7',
    previewColors: {
      canvas: '#F5F7FA',
      surface: '#FFFFFF',
      accent: '#0284C7',
    },
    light: {
      canvas: '#F5F7FA',
      surface: '#FFFFFF',
      surfaceMuted: '#EBF1F6',
      surfaceSelected: '#DEE7F0',
      line: '#DFE5EC',
      ink: '#0F172A',
      inkMuted: '#475569',
      inkSubtle: '#64748B',
      accent: '#0284C7',
      accentSoft: '#E0F2FE',
      onAccent: '#FFFFFF',
      success: '#059669',
      warning: '#D97706',
      danger: '#DC2626',
      overlay: 'rgba(15, 23, 42, 0.35)',
    },
    dark: {
      canvas: '#0B1320',
      surface: '#111D30',
      surfaceMuted: '#192841',
      surfaceSelected: '#233858',
      line: '#203350',
      ink: '#F1F5F9',
      inkMuted: '#94A3B8',
      inkSubtle: '#64748B',
      accent: '#38BDF8',
      accentSoft: '#0C4A6E',
      onAccent: '#082F49',
      success: '#34D399',
      warning: '#FBBF24',
      danger: '#F87171',
      overlay: 'rgba(0, 0, 0, 0.65)',
    },
    chartColors: {
      light: [
        '#0284C7',
        '#3B82F6',
        '#0D9488',
        '#F59E0B',
        '#8B5CF6',
        '#EC4899',
        '#10B981',
        '#64748B',
      ],
      dark: [
        '#38BDF8',
        '#60A5FA',
        '#2DD4BF',
        '#FBBF24',
        '#A78BFA',
        '#F472B6',
        '#34D399',
        '#94A3B8',
      ],
    },
  },

  'sage-forest': {
    id: 'sage-forest',
    accentColor: '#38734C',
    previewColors: {
      canvas: '#F4F6F3',
      surface: '#FFFFFF',
      accent: '#38734C',
    },
    light: {
      canvas: '#F4F6F3',
      surface: '#FFFFFF',
      surfaceMuted: '#E9EFE7',
      surfaceSelected: '#DCE5D9',
      line: '#DAE2D7',
      ink: '#141E16',
      inkMuted: '#516154',
      inkSubtle: '#6E8071',
      accent: '#38734C',
      accentSoft: '#E1EFE4',
      onAccent: '#FFFFFF',
      success: '#2E7D32',
      warning: '#C67D0A',
      danger: '#C62828',
      overlay: 'rgba(20, 30, 22, 0.35)',
    },
    dark: {
      canvas: '#101612',
      surface: '#17201A',
      surfaceMuted: '#202C24',
      surfaceSelected: '#2B3B30',
      line: '#2C3A30',
      ink: '#EDF4EE',
      inkMuted: '#9AB3A0',
      inkSubtle: '#728977',
      accent: '#6EC087',
      accentSoft: '#133520',
      onAccent: '#0A2112',
      success: '#81C784',
      warning: '#F5B041',
      danger: '#E57373',
      overlay: 'rgba(8, 12, 9, 0.65)',
    },
    chartColors: {
      light: [
        '#38734C',
        '#689F38',
        '#00897B',
        '#D48817',
        '#5C6BC0',
        '#8D6E63',
        '#00ACC1',
        '#78909C',
      ],
      dark: [
        '#6EC087',
        '#9CCC65',
        '#4DB6AC',
        '#FFB74D',
        '#7986CB',
        '#BCAAA4',
        '#4DD0E1',
        '#90A4AE',
      ],
    },
  },

  'iris-violet': {
    id: 'iris-violet',
    accentColor: '#6366F1',
    previewColors: {
      canvas: '#F8F7FC',
      surface: '#FFFFFF',
      accent: '#6366F1',
    },
    light: {
      canvas: '#F8F7FC',
      surface: '#FFFFFF',
      surfaceMuted: '#EFEBF8',
      surfaceSelected: '#E3DCF3',
      line: '#DFD8F0',
      ink: '#181424',
      inkMuted: '#5B5373',
      inkSubtle: '#7C7396',
      accent: '#6366F1',
      accentSoft: '#EEF2FF',
      onAccent: '#FFFFFF',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      overlay: 'rgba(24, 20, 36, 0.35)',
    },
    dark: {
      canvas: '#13111F',
      surface: '#1C192E',
      surfaceMuted: '#25213E',
      surfaceSelected: '#332D54',
      line: '#322C52',
      ink: '#F3F0FA',
      inkMuted: '#A79EC4',
      inkSubtle: '#7E759E',
      accent: '#818CF8',
      accentSoft: '#292552',
      onAccent: '#110F24',
      success: '#34D399',
      warning: '#FBBF24',
      danger: '#F87171',
      overlay: 'rgba(10, 8, 18, 0.65)',
    },
    chartColors: {
      light: [
        '#6366F1',
        '#8B5CF6',
        '#EC4899',
        '#06B6D4',
        '#F59E0B',
        '#10B981',
        '#64748B',
        '#F43F5E',
      ],
      dark: [
        '#818CF8',
        '#A78BFA',
        '#F472B6',
        '#22D3EE',
        '#FBBF24',
        '#34D399',
        '#94A3B8',
        '#FB7185',
      ],
    },
  },

  'amber-glow': {
    id: 'amber-glow',
    accentColor: '#B45309',
    previewColors: {
      canvas: '#FAF7F2',
      surface: '#FFFFFF',
      accent: '#B45309',
    },
    light: {
      canvas: '#FAF7F2',
      surface: '#FFFFFF',
      surfaceMuted: '#F4EEE4',
      surfaceSelected: '#EAE1D3',
      line: '#E5DCCE',
      ink: '#1E1710',
      inkMuted: '#6B5B4C',
      inkSubtle: '#8C7A68',
      accent: '#B45309',
      accentSoft: '#FEF3C7',
      onAccent: '#FFFFFF',
      success: '#2E7D32',
      warning: '#D97706',
      danger: '#DC2626',
      overlay: 'rgba(30, 23, 16, 0.35)',
    },
    dark: {
      canvas: '#171410',
      surface: '#221D17',
      surfaceMuted: '#2E271F',
      surfaceSelected: '#3C3329',
      line: '#3D3429',
      ink: '#F7F3EE',
      inkMuted: '#B8A896',
      inkSubtle: '#8F806F',
      accent: '#F59E0B',
      accentSoft: '#3D2808',
      onAccent: '#1E1202',
      success: '#81C784',
      warning: '#FBBF24',
      danger: '#F87171',
      overlay: 'rgba(12, 10, 8, 0.65)',
    },
    chartColors: {
      light: [
        '#B45309',
        '#D97706',
        '#4D7C0F',
        '#0284C7',
        '#7C3AED',
        '#BE185D',
        '#B45309',
        '#78716C',
      ],
      dark: [
        '#F59E0B',
        '#FBBF24',
        '#A3E635',
        '#38BDF8',
        '#A78BFA',
        '#F472B6',
        '#FCD34D',
        '#A8A29E',
      ],
    },
  },
};

export const COLOR_SCHEMES_LIST = Object.values(ColorSchemes);

export const DEFAULT_COLOR_SCHEME_ID: ColorSchemeId = 'chatgpt-emerald';

/**
 * 保持对旧代码直接引入 Palette / CategoryChartColors 的兼容
 */
export const Palette = {
  light: ColorSchemes['chatgpt-emerald'].light,
  dark: ColorSchemes['chatgpt-emerald'].dark,
};

export const CategoryChartColors = {
  light: ColorSchemes['chatgpt-emerald'].chartColors.light,
  dark: ColorSchemes['chatgpt-emerald'].chartColors.dark,
};

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
 * 浅色：使用 1px line 边框 + 极轻微阴影
 * 深色：不使用阴影，通过明度递进表达层级
 */
export function getCardSurfaceStyle(
  theme: ResolvedTheme,
  customPalette?: ThemePalette
): ViewStyle {
  const pal = customPalette ?? (theme === 'dark' ? Palette.dark : Palette.light);
  if (theme === 'dark') {
    return {
      backgroundColor: pal.surface,
      borderWidth: 0,
    };
  }
  return {
    backgroundColor: pal.surface,
    borderWidth: 1,
    borderColor: pal.line,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.04)',
      } as unknown as ViewStyle,
    }),
  };
}
