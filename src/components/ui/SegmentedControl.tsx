import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { useHaptic } from '@/lib/haptics';
import { RadiusTokens } from '@/theme/tokens';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

const TRACK_PADDING = 4;

/**
 * Section 6.5 & 6.8: Segmented Control
 * 基于 React Native Reanimated 实现丝滑胶囊平移与色彩渐变过渡 + 纯触觉反馈（无组件抖动缩放）
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  const { palette } = useResolvedTheme();
  const { haptic } = useHaptic();

  const [trackWidth, setTrackWidth] = useState(0);
  const isFirstLayout = useRef(true);

  const activeIndex = useMemo(() => {
    const idx = options.findIndex((o) => o.value === value);
    return idx >= 0 ? idx : 0;
  }, [options, value]);

  const segmentWidth = useMemo(() => {
    if (trackWidth <= 0 || options.length === 0) return 0;
    return Math.max(0, (trackWidth - TRACK_PADDING * 2) / options.length);
  }, [trackWidth, options.length]);

  const translateX = useSharedValue(0);

  useEffect(() => {
    if (segmentWidth <= 0) return;
    const targetX = activeIndex * segmentWidth;

    if (isFirstLayout.current) {
      translateX.value = targetX;
      isFirstLayout.current = false;
    } else {
      translateX.value = withTiming(targetX, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [activeIndex, segmentWidth, translateX]);

  const animatedTrackStyle = useAnimatedStyle(
    () => ({
      backgroundColor: withTiming(palette.surfaceMuted, {
        duration: 240,
        easing: Easing.out(Easing.quad),
      }),
    }),
    [palette.surfaceMuted],
  );

  const animatedPillStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateX: translateX.value }],
      backgroundColor: withTiming(palette.surfaceSelected, {
        duration: 240,
        easing: Easing.out(Easing.quad),
      }),
    }),
    [palette.surfaceSelected],
  );

  const handleTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - trackWidth) > 0.5) {
      setTrackWidth(w);
    }
  };

  return (
    <Animated.View
      accessibilityRole="tablist"
      onLayout={handleTrackLayout}
      style={[styles.track, animatedTrackStyle]}
      className={className}>
      {segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            { width: segmentWidth },
            animatedPillStyle,
          ]}
        />
      ) : null}

      {options.map((opt, idx) => {
        const selected = idx === activeIndex;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              if (opt.value !== value) {
                haptic('selection');
                if (segmentWidth > 0) {
                  translateX.value = withTiming(idx * segmentWidth, {
                    duration: 220,
                    easing: Easing.out(Easing.cubic),
                  });
                }
              }
              onChange(opt.value);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label}
            style={styles.segment}>
            <Text
              style={[
                styles.label,
                {
                  color: selected ? palette.ink : palette.inkMuted,
                  fontWeight: selected ? '600' : '400',
                },
              ]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: TRACK_PADDING,
    borderRadius: RadiusTokens.md,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    left: TRACK_PADDING,
    borderRadius: RadiusTokens.sm,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RadiusTokens.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
  },
});
