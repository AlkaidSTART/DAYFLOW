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

/**
 * Section 6.12: 操作成功底部 Snackbar
 * 2 秒自动消失，可撤销
 */
export function Snackbar() {
  const snackbar = useSettingsStore((s) => s.snackbar);
  const hideSnackbar = useSettingsStore((s) => s.hideSnackbar);
  const insets = useSafeAreaInsets();

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
        animatedStyle,
        {
          bottom: Math.max(insets.bottom, 16) + 72,
        },
      ]}
      className="absolute left-6 right-6 z-50">
      <View className="bg-ink dark:bg-surface-selected-dark rounded-md px-4 py-3.5 flex-row items-center justify-between border border-line dark:border-line-dark">
        <Text className="text-caption text-canvas dark:text-ink-dark flex-1 mr-3">
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
            className="px-2 py-1">
            <Text className="text-caption font-semibold text-accent-soft dark:text-accent-dark">
              {snackbar.undoLabel ?? '撤销'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}
