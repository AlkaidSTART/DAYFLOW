import { Appearance } from 'react-native';
import { create } from 'zustand';

import {
  ColorSchemeId,
  ColorSchemes,
  DEFAULT_COLOR_SCHEME_ID,
  ResolvedTheme,
  syncThemeCssVariables,
} from '@/theme/tokens';

export type ThemePreference = 'light' | 'dark' | 'system';
export type { ColorSchemeId };

export type SnackbarPayload = {
  id: string;
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
};

export type SettingsState = {
  themePreference: ThemePreference;
  colorSchemeId: ColorSchemeId;
  systemTheme: ResolvedTheme;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  keepScreenAwake: boolean;
  hapticEnabled: boolean;
  notificationsEnabled: boolean;
  budgetThresholdPercent: number;
  monthStartDay: number;
  snackbar: SnackbarPayload | null;

  setThemePreference: (theme: ThemePreference) => void;
  setColorSchemeId: (colorSchemeId: ColorSchemeId) => void;
  setSystemTheme: (systemTheme: ResolvedTheme) => void;
  setFocusDuration: (
    field: 'focusMinutes' | 'shortBreakMinutes' | 'longBreakMinutes',
    minutes: number,
  ) => void;
  setKeepScreenAwake: (value: boolean) => void;
  setHapticEnabled: (value: boolean) => void;
  toggleHapticEnabled: () => void;
  setNotificationsEnabled: (value: boolean) => void;
  setBudgetThresholdPercent: (percent: number) => void;
  showSnackbar: (message: string, onUndo?: () => void, undoLabel?: string) => void;
  hideSnackbar: () => void;
};

function resolveActiveTheme(
  preference: ThemePreference,
  systemTheme: ResolvedTheme,
): ResolvedTheme {
  if (preference === 'dark') return 'dark';
  if (preference === 'light') return 'light';
  return systemTheme;
}

function applyThemeVariables(
  preference: ThemePreference,
  colorSchemeId: ColorSchemeId,
  systemTheme: ResolvedTheme,
) {
  const resolved = resolveActiveTheme(preference, systemTheme);
  const scheme = ColorSchemes[colorSchemeId] ?? ColorSchemes[DEFAULT_COLOR_SCHEME_ID];
  syncThemeCssVariables(scheme[resolved], resolved === 'dark');
}

const initialSystemTheme: ResolvedTheme =
  Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  themePreference: 'system',
  colorSchemeId: DEFAULT_COLOR_SCHEME_ID,
  systemTheme: initialSystemTheme,
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  keepScreenAwake: false,
  hapticEnabled: true,
  notificationsEnabled: true,
  budgetThresholdPercent: 80,
  monthStartDay: 1,
  snackbar: null,

  setThemePreference: (themePreference) => {
    const { colorSchemeId, systemTheme } = get();
    applyThemeVariables(themePreference, colorSchemeId, systemTheme);
    set({ themePreference });
  },
  setColorSchemeId: (colorSchemeId) => {
    const { themePreference, systemTheme } = get();
    applyThemeVariables(themePreference, colorSchemeId, systemTheme);
    set({ colorSchemeId });
  },
  setSystemTheme: (systemTheme) => {
    const { themePreference, colorSchemeId } = get();
    applyThemeVariables(themePreference, colorSchemeId, systemTheme);
    set({ systemTheme });
  },
  setFocusDuration: (field, minutes) => set({ [field]: minutes }),
  setKeepScreenAwake: (keepScreenAwake) => set({ keepScreenAwake }),
  setHapticEnabled: (hapticEnabled) => set({ hapticEnabled }),
  toggleHapticEnabled: () => set((state) => ({ hapticEnabled: !state.hapticEnabled })),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  setBudgetThresholdPercent: (budgetThresholdPercent) => set({ budgetThresholdPercent }),
  showSnackbar: (message, onUndo, undoLabel = '撤销') =>
    set({
      snackbar: {
        id: `${Date.now()}_${Math.random()}`,
        message,
        onUndo,
        undoLabel,
      },
    }),
  hideSnackbar: () => set({ snackbar: null }),
}));
