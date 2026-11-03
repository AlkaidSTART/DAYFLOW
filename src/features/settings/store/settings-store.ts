import { create } from 'zustand';

import { ColorSchemeId, DEFAULT_COLOR_SCHEME_ID } from '@/theme/tokens';

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
  setFocusDuration: (
    field: 'focusMinutes' | 'shortBreakMinutes' | 'longBreakMinutes',
    minutes: number,
  ) => void;
  setKeepScreenAwake: (value: boolean) => void;
  setHapticEnabled: (value: boolean) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setBudgetThresholdPercent: (percent: number) => void;
  showSnackbar: (message: string, onUndo?: () => void, undoLabel?: string) => void;
  hideSnackbar: () => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  themePreference: 'system',
  colorSchemeId: DEFAULT_COLOR_SCHEME_ID,
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  keepScreenAwake: false,
  hapticEnabled: true,
  notificationsEnabled: true,
  budgetThresholdPercent: 80,
  monthStartDay: 1,
  snackbar: null,

  setThemePreference: (themePreference) => set({ themePreference }),
  setColorSchemeId: (colorSchemeId) => set({ colorSchemeId }),
  setFocusDuration: (field, minutes) => set({ [field]: minutes }),
  setKeepScreenAwake: (keepScreenAwake) => set({ keepScreenAwake }),
  setHapticEnabled: (hapticEnabled) => set({ hapticEnabled }),
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
