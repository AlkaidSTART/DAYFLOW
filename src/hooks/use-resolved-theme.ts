import { useMemo } from 'react';

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

export function getResolvedThemeSnapshot(): UseResolvedThemeResult {
  const { themePreference, colorSchemeId, systemTheme } = useSettingsStore.getState();
  const resolved: ResolvedTheme =
    themePreference === 'dark'
      ? 'dark'
      : themePreference === 'light'
        ? 'light'
        : systemTheme;

  const currentScheme =
    ColorSchemes[colorSchemeId] ?? ColorSchemes[DEFAULT_COLOR_SCHEME_ID];
  const palette = currentScheme[resolved];
  const chartColors = currentScheme.chartColors[resolved];

  return {
    theme: resolved,
    isDark: resolved === 'dark',
    palette,
    colorSchemeId: currentScheme.id,
    colorScheme: currentScheme,
    chartColors,
  };
}

export function useResolvedTheme(): UseResolvedThemeResult {
  const preference = useSettingsStore((s) => s.themePreference);
  const colorSchemeId = useSettingsStore((s) => s.colorSchemeId);
  const systemTheme = useSettingsStore((s) => s.systemTheme);

  const resolved: ResolvedTheme =
    preference === 'dark'
      ? 'dark'
      : preference === 'light'
        ? 'light'
        : systemTheme;

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
