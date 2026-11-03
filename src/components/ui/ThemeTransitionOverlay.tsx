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
let pendingFrameId: number | null = null;

/**
 * 执行平滑主题/配色渐变切换的统一调度器（基于 React Native Reanimated UI 线程硬件加速）
 * - 第 1 帧（0ms）：立即在 UI 线程启动旧底色渐变消融动效与控件滑动，不阻塞点击响应
 * - 下一帧（requestAnimationFrame）：在 UI 线程渐变遮罩掩护下完成底层主题切换，呈现丝滑交叉渐变
 */
export function executeThemeTransition(updateFn: () => void) {
  const prevCanvas = getResolvedThemeSnapshot().palette.canvas;

  if (activeTrigger) {
    activeTrigger(prevCanvas);
  }

  if (pendingFrameId !== null) {
    cancelAnimationFrame(pendingFrameId);
  }

  pendingFrameId = requestAnimationFrame(() => {
    pendingFrameId = null;
    updateFn();
  });
}

/**
 * 全局主题平滑渐变过渡层（完全由 Reanimated Worklet 驱动，零 React 重渲染开销）
 */
export function ThemeTransitionOverlay() {
  const veilOpacity = useSharedValue(0);
  const veilColor = useSharedValue('#F7F7F8');

  useEffect(() => {
    activeTrigger = (previousCanvas: string) => {
      veilColor.value = previousCanvas;
      veilOpacity.value = 0.82;
      veilOpacity.value = withTiming(0, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
    };

    return () => {
      activeTrigger = null;
      if (pendingFrameId !== null) {
        cancelAnimationFrame(pendingFrameId);
        pendingFrameId = null;
      }
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
