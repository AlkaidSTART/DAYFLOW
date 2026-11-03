import React from 'react';
import { Pressable, Text, View } from 'react-native';

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
 * 选中底 surface-selected，选中文字 ink，未选中 ink-muted
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityRole="tablist"
      className={`flex-row p-1 rounded-md bg-surface-muted dark:bg-surface-muted-dark ${className}`}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label}
            className={`flex-1 min-h-[40px] px-3 py-2 rounded-sm items-center justify-center ${
              selected ? 'bg-surface-selected dark:bg-surface-selected-dark' : 'bg-transparent'
            }`}>
            <Text
              className={`text-caption ${
                selected
                  ? 'text-ink dark:text-ink-dark font-semibold'
                  : 'text-ink-muted dark:text-ink-muted-dark'
              }`}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
