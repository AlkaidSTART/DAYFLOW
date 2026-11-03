import { motion } from 'motion/react';
import React, { useId } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';
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
 * Section 6.5 & 6.8: Segmented Control
 * 选中底 surface-selected（支持 motion layoutId 滑动胶囊动效），选中文字 ink，未选中 ink-muted
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  const { palette } = useResolvedTheme();
  const groupId = useId();

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
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label}
            style={[
              styles.segment,
              Platform.OS !== 'web' && selected
                ? { backgroundColor: palette.surfaceSelected }
                : undefined,
            ]}>
            {Platform.OS === 'web' && selected ? (
              <motion.div
                layoutId={`segment_pill_${groupId}`}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 32,
                  mass: 0.75,
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: RadiusTokens.sm,
                  backgroundColor: palette.surfaceSelected,
                }}
              />
            ) : null}

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
