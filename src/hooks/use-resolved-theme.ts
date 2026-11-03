import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useMemo } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useSettingsStore } from '@/features/settings/store/settings-store';
import {
  ColorSchemeId,
  ColorSchemeItem,
  ColorSchemes,
  DEFAULT_COLOR_SCHEME_ID,
  ResolvedTheme,
  ThemePalette,
} from '@/theme/tokens';

export interface UseResolvedThemeResult {
  theme: ResolvedTheme;
  isDark: boolean;
  palette: ThemePalette;
  colorSchemeId: ColorSchemeId;
  colorScheme: ColorSchemeItem;
  chartColors: readonly string[];
}

export function useResolvedTheme(): UseResolvedThemeResult {
  const preference = useSettingsStore((s) => s.themePreference);
  const colorSchemeId = useSettingsStore((s) => s.colorSchemeId);
  const systemScheme = useRNColorScheme();
  const { colorScheme: nwScheme } = useNativeWindColorScheme();

  let resolved: ResolvedTheme = 'light';
  if (preference === 'dark') {
    resolved = 'dark';
  } else if (preference === 'light') {
    resolved = 'light';
  } else {
    resolved = (nwScheme ?? systemScheme) === 'dark' ? 'dark' : 'light';
  }

  const currentScheme =
    ColorSchemes[colorSchemeId] ?? ColorSchemes[DEFAULT_COLOR_SCHEME_ID];
  const palette = currentScheme[resolved];
  const chartColors = currentScheme.chartColors[resolved];

  return useMemo(
    () => ({
      theme: resolved,
      isDark: resolved === 'dark',
      palette,
      colorSchemeId: currentScheme.id,
      colorScheme: currentScheme,
      chartColors,
    }),
    [resolved, palette, currentScheme, chartColors],
  );
}
