import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';

/**
 * 全局主题平滑过渡层
 * 切换主题模式或配色方案时，无缝交叉淡出，消除硬切换闪烁
 */
export function ThemeTransitionOverlay() {
  const { palette, colorSchemeId, theme } = useResolvedTheme();
  const themeKey = `${colorSchemeId}-${theme}`;

  const lastKeyRef = useRef(themeKey);
  const lastCanvasRef = useRef(palette.canvas);

  const [overlayColor, setOverlayColor] = useState<string | null>(null);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // 首次挂载时不执行过渡
    if (lastKeyRef.current !== themeKey) {
      const prevCanvas = lastCanvasRef.current;
      setOverlayColor(prevCanvas);

      // 从 1 平滑衰减到 0，露出下方新主题
      opacity.value = 1;
      opacity.value = withTiming(
        0,
        {
          duration: 340,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
        (finished) => {
          if (finished) {
            runOnJS(setOverlayColor)(null);
          }
        }
      );

      lastKeyRef.current = themeKey;
      lastCanvasRef.current = palette.canvas;
    } else {
      lastCanvasRef.current = palette.canvas;
    }
  }, [themeKey, palette.canvas, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!overlayColor) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: overlayColor,
          zIndex: 9999,
        },
        animatedStyle,
      ]}
    />
  );
}
