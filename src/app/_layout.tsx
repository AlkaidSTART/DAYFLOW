import '@/global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { cssInterop } from 'nativewind';
import React, { useEffect, useMemo } from 'react';
import { Appearance, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Snackbar } from '@/components/ui/Snackbar';
import { ThemeTransitionOverlay } from '@/components/ui/ThemeTransitionOverlay';
import { UpdatePromptSheet } from '@/features/settings/components/UpdatePromptSheet';
import { useSettingsStore } from '@/features/settings/store/settings-store';
import { useVersionStore } from '@/features/settings/store/version-store';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';

// 注册第三方/复合容器组件以支持 NativeWind className
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(KeyboardAvoidingView, { className: 'style' });

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const setSystemTheme = useSettingsStore((s) => s.setSystemTheme);
  const checkForUpdates = useVersionStore((s) => s.checkForUpdates);
  const { isDark, palette } = useResolvedTheme();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, [isDark]);

  useEffect(() => {
    const sys = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
    setSystemTheme(sys);

    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => sub.remove();
  }, [setSystemTheme]);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // 启动时静默对比当前版本与 GitHub 仓库最新版本，落后时温和提示乐观更新
  useEffect(() => {
    checkForUpdates({ silent: true }).catch(() => {});
  }, [checkForUpdates]);

  const navigationTheme = useMemo(
    () =>
      isDark
        ? {
            ...DarkTheme,
            colors: {
              ...DarkTheme.colors,
              background: palette.canvas,
              card: palette.surface,
              text: palette.ink,
              border: palette.line,
              primary: palette.accent,
            },
          }
        : {
            ...DefaultTheme,
            colors: {
              ...DefaultTheme.colors,
              background: palette.canvas,
              card: palette.surface,
              text: palette.ink,
              border: palette.line,
              primary: palette.accent,
            },
          },
    [isDark, palette],
  );

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View
          style={{ flex: 1, backgroundColor: palette.canvas }}
          className={`flex-1 ${isDark ? 'dark' : ''}`}>
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
          <UpdatePromptSheet />
          <Snackbar />
          <ThemeTransitionOverlay />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
