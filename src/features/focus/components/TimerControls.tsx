import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { FocusMode, TimerPhase } from '@/features/focus/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';

export type TimerControlsProps = {
  mode: FocusMode;
  phase: TimerPhase;
  linkedTaskTitle: string | null;
  onPressTaskLink: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRequestFinish: () => void;
  onSkipBreak: () => void;
};

/**
 * Section 6.5:
 * - 主按钮：填充 accent（休息模式为 success），白字，圆角 full，高 56，宽度自适应留白
 * - 次按钮：描边 line，ink 文字，透明底
 * - 关联任务：一行可点击区域，未关联时显示「选择任务」+ ink-muted
 */
export function TimerControls({
  mode,
  phase,
  linkedTaskTitle,
  onPressTaskLink,
  onStart,
  onPause,
  onResume,
  onRequestFinish,
  onSkipBreak,
}: TimerControlsProps) {
  const { palette } = useResolvedTheme();
  const isBreak = mode !== 'focus';
  const primaryVariant = isBreak ? 'success' : 'primary';

  if (phase === 'completed') {
    return null;
  }

  return (
    <View className="items-center w-full">
      {/* 关联任务可点击行 */}
      <Pressable
        onPress={onPressTaskLink}
        accessibilityRole="button"
        accessibilityLabel={linkedTaskTitle ? `当前关联任务：${linkedTaskTitle}，点击更换` : '选择关联任务'}
        className="min-h-[48px] px-4 py-2 rounded-full flex-row items-center justify-center mb-6">
        <Ionicons
          name="bookmark-outline"
          size={16}
          color={linkedTaskTitle ? palette.ink : palette.inkMuted}
        />
        <Text
          numberOfLines={1}
          className={`text-body ml-2 max-w-[240px] ${
            linkedTaskTitle
              ? 'text-ink dark:text-ink-dark font-medium'
              : 'text-ink-muted dark:text-ink-muted-dark'
          }`}>
          {linkedTaskTitle ? `关联：${linkedTaskTitle}` : '选择任务'}
        </Text>
        <Ionicons
          name="chevron-forward-outline"
          size={15}
          color={palette.inkSubtle}
          style={{ marginLeft: 4 }}
        />
      </Pressable>

      {/* 控制按钮区 */}
      {phase === 'idle' ? (
        <View className="flex-row items-center justify-center gap-4 w-full px-6">
          <Button
            label={isBreak ? '开始休息' : '开始专注'}
            onPress={onStart}
            variant={primaryVariant}
            size="lg"
            className="min-w-[180px]"
          />
          {isBreak ? (
            <Button
              label="跳过"
              onPress={onSkipBreak}
              variant="outline"
              size="lg"
              className="px-6"
            />
          ) : null}
        </View>
      ) : (
        <View className="flex-row items-center justify-center gap-4 w-full px-6">
          <Button
            label={phase === 'running' ? '暂停' : '继续'}
            onPress={phase === 'running' ? onPause : onResume}
            variant={primaryVariant}
            size="lg"
            className="min-w-[140px]"
          />
          <Button
            label={isBreak ? '跳过休息' : '结束'}
            onPress={isBreak ? onSkipBreak : onRequestFinish}
            variant="outline"
            size="lg"
            className="min-w-[120px]"
          />
        </View>
      )}
    </View>
  );
}
