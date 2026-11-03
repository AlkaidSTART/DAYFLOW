import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useSettingsStore } from '@/features/settings/store/settings-store';
import { Palette, ResolvedTheme } from '@/theme/tokens';

export function useResolvedTheme(): {
  theme: ResolvedTheme;
  isDark: boolean;
  palette: (typeof Palette)[ResolvedTheme];
} {
  const preference = useSettingsStore((s) => s.themePreference);
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

  return {
    theme: resolved,
    isDark: resolved === 'dark',
    palette: Palette[resolved],
  };
}
