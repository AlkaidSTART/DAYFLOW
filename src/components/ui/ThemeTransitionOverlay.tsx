import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { getResolvedThemeSnapshot } from '@/hooks/use-resolved-theme';

type TransitionTrigger = (previousCanvas: string) => void;

let activeTrigger: TransitionTrigger | null = null;

/**
 * 执行平滑主题/配色切换的统一调度器（基于 React Native Reanimated UI 线程硬件加速）
 * - 零延迟同步更新状态，不阻塞任何手势或连续点击
 * - 利用 Reanimated SharedValue 将旧主题底色从半透明平滑消融至新主题，实现 60/120fps 丝滑交叉过渡
 */
export function executeThemeTransition(updateFn: () => void) {
  const prevCanvas = getResolvedThemeSnapshot().palette.canvas;
  updateFn();
  const nextCanvas = getResolvedThemeSnapshot().palette.canvas;

  if (activeTrigger) {
    activeTrigger(prevCanvas !== nextCanvas ? prevCanvas : nextCanvas);
  }
}

/**
 * 全局主题平滑过渡层（完全由 Reanimated Worklet 驱动，零 React 重渲染开销）
 */
export function ThemeTransitionOverlay() {
  const veilOpacity = useSharedValue(0);
  const veilColor = useSharedValue('#F7F7F8');

  useEffect(() => {
    activeTrigger = (previousCanvas: string) => {
      veilColor.value = previousCanvas;
      veilOpacity.value = 0.52;
      veilOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
    };

    return () => {
      activeTrigger = null;
    };
  }, [veilColor, veilOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: veilOpacity.value,
    backgroundColor: veilColor.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      accessible={false}
      style={[StyleSheet.absoluteFill, styles.overlay, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 999,
  },
});
