import '@/global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import React, { useEffect } from 'react';
import { Appearance, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Snackbar } from '@/components/ui/Snackbar';
import { useSettingsStore } from '@/features/settings/store/settings-store';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { Palette } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const themePreference = useSettingsStore((s) => s.themePreference);
  const { setColorScheme } = useNativeWindColorScheme();
  const { isDark, palette } = useResolvedTheme();

  // Section 12: 切换方式：设置项三选一，跟随系统时监听 Appearance 变化；切换即时生效
  useEffect(() => {
    if (themePreference === 'system') {
      const sys = Appearance.getColorScheme() ?? 'light';
      setColorScheme(sys);
      const sub = Appearance.addChangeListener(({ colorScheme }) => {
        setColorScheme(colorScheme ?? 'light');
      });
      return () => sub.remove();
    } else {
      setColorScheme(themePreference);
    }
  }, [themePreference, setColorScheme]);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: Palette.dark.canvas,
          card: Palette.dark.surface,
          text: Palette.dark.ink,
          border: Palette.dark.line,
          primary: Palette.dark.accent,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: Palette.light.canvas,
          card: Palette.light.surface,
          text: Palette.light.ink,
          border: Palette.light.line,
          primary: Palette.light.accent,
        },
      };

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View className={`flex-1 bg-canvas dark:bg-canvas-dark ${isDark ? 'dark' : ''}`}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.canvas },
              animation: 'default',
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="settings/index"
              options={{
                headerShown: false,
                presentation: 'card',
              }}
            />
          </Stack>
          <Snackbar />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
