import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { TodayProgressSummary } from '@/features/today/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { getCardSurfaceStyle, tabularNumsStyle } from '@/theme/tokens';

export type ProgressCardProps = {
  progress: TodayProgressSummary;
  focusSessionsCount: number;
  focusMinutesTotal: number;
  onPressGoFocus: () => void;
  onPressAddTask: () => void;
  onPressDailyReview: () => void;
};

/**
 * Section 6.4 & 7.1: 进度卡（ProgressCard）
 * - 卡片内含：已完成 2 / 5、百分比、细进度条
 * - 进度条高度 6，圆角 full，轨道 surface-muted，填充 accent
 * - 无任务时：进度条隐藏，展示「今天还没有任务，从最重要的一件事开始。」+ 新建按钮，不展示 0% 或 NaN
 * - 百分比文字使用 tabular-nums
 */
export function ProgressCard({
  progress,
  focusSessionsCount,
  focusMinutesTotal,
  onPressGoFocus,
  onPressAddTask,
  onPressDailyReview,
}: ProgressCardProps) {
  const { theme, palette } = useResolvedTheme();
  const barWidth = useSharedValue(progress.percentage);

  useEffect(() => {
    barWidth.value = withTiming(progress.percentage, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress.percentage, barWidth]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, barWidth.value))}%`,
  }));

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-h2 text-ink dark:text-ink-dark">今日进度</Text>
        <Pressable
          onPress={onPressDailyReview}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="打开每日复盘"
          className="min-h-[36px] px-2 items-center justify-center">
          <Text className="text-caption font-semibold text-accent dark:text-accent-dark">
            每日复盘
          </Text>
        </Pressable>
      </View>

      <View style={getCardSurfaceStyle(theme)} className="rounded-lg p-4">
        {progress.totalCount === 0 ? (
          <View className="py-2">
            <Text className="text-body text-ink-muted dark:text-ink-muted-dark mb-4">
              今天还没有任务，从最重要的一件事开始。
            </Text>
            <View className="flex-row">
              <Button
                label="新建第一个任务"
                onPress={onPressAddTask}
                variant="primary"
                size="sm"
              />
            </View>
          </View>
        ) : (
          <>
            <View className="flex-row items-baseline justify-between mb-2.5">
              <Text
                style={tabularNumsStyle}
                className="text-body-strong text-ink dark:text-ink-dark">
                已完成 {progress.completedCount} / {progress.totalCount}
              </Text>
              <Text
                style={tabularNumsStyle}
                className="text-caption font-semibold text-accent dark:text-accent-dark">
                {progress.percentage}%
              </Text>
            </View>

            {/* 高度 6，圆角 full，轨道 surface-muted，填充 accent */}
            <View className="h-[6px] rounded-full bg-surface-muted dark:bg-surface-muted-dark overflow-hidden">
              <Animated.View
                style={animatedBarStyle}
                className="h-full rounded-full bg-accent dark:bg-accent-dark"
              />
            </View>
          </>
        )}

        {/* Focus 摘要行 */}
        <View className="mt-4 pt-3 border-t border-line dark:border-line-dark flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="timer-outline" size={18} color={palette.inkMuted} />
            <Text
              style={tabularNumsStyle}
              className="text-caption text-ink-muted dark:text-ink-muted-dark ml-1.5">
              专注 {focusSessionsCount} 次 · 共 {focusMinutesTotal} 分钟
            </Text>
          </View>

          <Pressable
            onPress={onPressGoFocus}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="查看专注中心"
            className="flex-row items-center py-1">
            <Text className="text-caption font-semibold text-accent dark:text-accent-dark mr-1">
              查看专注
            </Text>
            <Ionicons name="arrow-forward-outline" size={14} color={palette.accent} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
