import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
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

type SegmentButtonProps = {
  label: string;
  selected: boolean;
  inkColor: string;
  inkMutedColor: string;
  onPress: () => void;
};

function SegmentButton({
  label,
  selected,
  inkColor,
  inkMutedColor,
  onPress,
}: SegmentButtonProps) {
  const scale = useSharedValue(1);

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withTiming(0.95, {
          duration: 70,
          easing: Easing.out(Easing.quad),
        });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 16,
          stiffness: 360,
        });
      }}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={styles.segment}>
      <Animated.View style={animatedTextStyle}>
        <Text
          style={[
            styles.label,
            {
              color: selected ? inkColor : inkMutedColor,
              fontWeight: selected ? '600' : '400',
            },
          ]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Section 6.5 & 6.8: Segmented Control
 * 基于 React Native Reanimated 实现跨平台硬件加速滑动胶囊动效 + 触觉反馈
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
  const pillScale = useSharedValue(1);

  useEffect(() => {
    if (segmentWidth <= 0) return;
    const targetX = activeIndex * segmentWidth;

    if (isFirstLayout.current) {
      translateX.value = targetX;
      isFirstLayout.current = false;
    } else {
      translateX.value = withSpring(targetX, {
        damping: 24,
        stiffness: 360,
        mass: 0.65,
      });
      pillScale.value = withSequence(
        withTiming(0.96, { duration: 55, easing: Easing.out(Easing.quad) }),
        withSpring(1, { damping: 18, stiffness: 360 }),
      );
    }
  }, [activeIndex, segmentWidth, translateX, pillScale]);

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: pillScale.value }],
  }));

  const handleTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - trackWidth) > 0.5) {
      setTrackWidth(w);
    }
  };

  return (
    <View
      accessibilityRole="tablist"
      onLayout={handleTrackLayout}
      style={[styles.track, { backgroundColor: palette.surfaceMuted }]}
      className={className}>
      {segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            {
              width: segmentWidth,
              backgroundColor: palette.surfaceSelected,
            },
            animatedPillStyle,
          ]}
        />
      ) : null}

      {options.map((opt, idx) => {
        const selected = idx === activeIndex;
        return (
          <SegmentButton
            key={opt.value}
            label={opt.label}
            selected={selected}
            inkColor={palette.ink}
            inkMutedColor={palette.inkMuted}
            onPress={() => {
              if (opt.value !== value) {
                haptic('selection');
              }
              onChange(opt.value);
            }}
          />
        );
      })}
    </View>
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
