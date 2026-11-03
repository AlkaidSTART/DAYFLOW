import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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

/**
 * Section 6.5 & 6.8: Segmented Control (Native 移动端实现)
 * 选中底 surface-selected（原生即时响应 + 触觉反馈），零冗余外部动效依赖
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  const { palette } = useResolvedTheme();
  const { haptic } = useHaptic();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.track,
        { backgroundColor: palette.surfaceMuted },
      ]}
      className={className}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              if (opt.value !== value) {
                haptic('selection');
              }
              onChange(opt.value);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label}
            style={[
              styles.segment,
              selected ? { backgroundColor: palette.surfaceSelected } : undefined,
            ]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: RadiusTokens.md,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RadiusTokens.sm,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    zIndex: 1,
  },
});
