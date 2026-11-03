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
import { useHaptic } from '@/lib/haptics';
import { getCardSurfaceStyle, tabularNumsStyle } from '@/theme/tokens';

export type ProgressCardProps = {
  progress: TodayProgressSummary;
  focusSessionsCount: number;
  focusMinutesTotal: number;
  onPressGoFocus: () => void;
  onPressAddTask: () => void;
  onPressDailyReview: () => void;
};

export function ProgressCard({
  progress,
  focusSessionsCount,
  focusMinutesTotal,
  onPressGoFocus,
  onPressAddTask,
  onPressDailyReview,
}: ProgressCardProps) {
  const { theme, palette } = useResolvedTheme();
  const { haptic } = useHaptic();
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
          onPress={() => {
            haptic('selection');
            onPressDailyReview();
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="打开每日复盘"
          className="min-h-[36px] px-2 items-center justify-center">
          <Text
            style={{ color: palette.accent }}
            className="text-caption font-semibold">
            每日复盘
          </Text>
        </Pressable>
      </View>

      <View style={getCardSurfaceStyle(theme, palette)} className="rounded-lg p-4">
        {progress.totalCount === 0 ? (
          <View className="py-2">
            <Text className="text-body text-ink-muted dark:text-ink-muted-dark mb-4">
              今天还没有任务，从最重要的一件事开始。
            </Text>
            <View className="flex-row">
              <Button
                label="新建第一个任务"
                onPress={() => {
                  haptic('selection');
                  onPressAddTask();
                }}
                variant="primary"
                size="sm"
              />
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => {
              haptic('selection');
              onPressDailyReview();
            }}
            accessibilityRole="button"
            accessibilityLabel={`今日已完成 ${progress.completedCount} / ${progress.totalCount}，点击查看每日复盘`}>
            <View className="flex-row items-baseline justify-between mb-2.5">
              <Text
                style={tabularNumsStyle}
                className="text-body-strong text-ink dark:text-ink-dark">
                已完成 {progress.completedCount} / {progress.totalCount}
              </Text>
              <Text
                style={[tabularNumsStyle, { color: palette.accent }]}
                className="text-caption font-semibold">
                {progress.percentage}%
              </Text>
            </View>

            {/* 高度 6，圆角 full，轨道 surface-muted，填充 accent */}
            <View className="h-[6px] rounded-full bg-surface-muted dark:bg-surface-muted-dark overflow-hidden">
              <Animated.View
                style={[
                  {
                    height: '100%',
                    borderRadius: 999,
                    backgroundColor: palette.accent,
                  },
                  animatedBarStyle,
                ]}
              />
            </View>
          </Pressable>
        )}

        {/* Focus 摘要行（整行可点击跳转专注中心） */}
        <Pressable
          onPress={() => {
            haptic('selection');
            onPressGoFocus();
          }}
          accessibilityRole="button"
          accessibilityLabel="查看专注中心"
          className="mt-4 pt-3 border-t border-line dark:border-line-dark flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="timer-outline" size={18} color={palette.inkMuted} />
            <Text
              style={tabularNumsStyle}
              className="text-caption text-ink-muted dark:text-ink-muted-dark ml-1.5">
              专注 {focusSessionsCount} 次 · 共 {focusMinutesTotal} 分钟
            </Text>
          </View>

          <View className="flex-row items-center py-1">
            <Text
              style={{ color: palette.accent }}
              className="text-caption font-semibold mr-1">
              查看专注
            </Text>
            <Ionicons name="arrow-forward-outline" size={14} color={palette.accent} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}
