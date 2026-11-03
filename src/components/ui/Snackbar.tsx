import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettingsStore } from '@/features/settings/store/settings-store';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { RadiusTokens } from '@/theme/tokens';

/**
 * Section 6.12: 操作成功底部 Snackbar
 * 2 秒自动消失，可撤销
 */
export function Snackbar() {
  const snackbar = useSettingsStore((s) => s.snackbar);
  const hideSnackbar = useSettingsStore((s) => s.hideSnackbar);
  const insets = useSafeAreaInsets();
  const { isDark, palette } = useResolvedTheme();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    if (!snackbar) {
      opacity.value = 0;
      translateY.value = 16;
      return;
    }

    opacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
    translateY.value = withTiming(0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });

    const timer = setTimeout(() => {
      hideSnackbar();
    }, 2400);

    return () => clearTimeout(timer);
  }, [snackbar, hideSnackbar, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!snackbar) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: Math.max(insets.bottom, 16) + 72,
          zIndex: 90,
        },
        animatedStyle,
      ]}>
      <View
        style={{
          backgroundColor: isDark ? palette.surfaceSelected : palette.ink,
          borderRadius: RadiusTokens.md,
          paddingHorizontal: 16,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: palette.line,
        }}>
        <Text
          style={{
            color: isDark ? palette.ink : palette.canvas,
            fontSize: 14,
            lineHeight: 20,
            flex: 1,
            marginRight: 12,
          }}>
          {snackbar.message}
        </Text>
        {snackbar.onUndo ? (
          <Pressable
            onPress={() => {
              snackbar.onUndo?.();
              hideSnackbar();
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={snackbar.undoLabel ?? '撤销'}
            style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text
              style={{
                color: isDark ? palette.accent : palette.accentSoft,
                fontSize: 14,
                lineHeight: 20,
                fontWeight: '600',
              }}>
              {snackbar.undoLabel ?? '撤销'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}
