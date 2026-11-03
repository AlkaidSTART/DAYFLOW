import React from 'react';

import { SegmentedControl, SegmentOption } from '@/components/ui/SegmentedControl';
import { FocusMode } from '@/features/focus/types';

const MODE_OPTIONS: SegmentOption<FocusMode>[] = [
  { value: 'focus', label: '专注' },
  { value: 'short_break', label: '短休息' },
  { value: 'long_break', label: '长休息' },
];

export type ModeSwitchProps = {
  mode: FocusMode;
  onSelectMode: (mode: FocusMode) => void;
};

/**
 * Section 6.5: 顶部三段式 Segmented Control，选中底 surface-selected
 */
export function ModeSwitch({ mode, onSelectMode }: ModeSwitchProps) {
  return (
    <SegmentedControl
      options={MODE_OPTIONS}
      value={mode}
      onChange={onSelectMode}
      className="w-full max-w-[320px] self-center"
    />
  );
}
