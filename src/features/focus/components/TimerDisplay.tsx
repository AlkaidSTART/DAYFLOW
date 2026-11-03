import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { computeProgressRatio, formatTimerMMSS } from '@/features/focus/timer/timer-machine';
import { FocusMode, TimerPhase } from '@/features/focus/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { tabularNumsStyle } from '@/theme/tokens';

export type TimerDisplayProps = {
  mode: FocusMode;
  phase: TimerPhase;
  plannedSeconds: number;
  remainingSeconds: number;
  completedMinutes: number;
  onRestart: () => void;
};

/**
 * Section 6.5 & 8.2:
 * - 计时数字：Display 放大版 64/72，tabular-nums，ink；暂停时 ink-muted
 * - 进度：计时器下方 4px 线性进度条，accent 填充；休息模式使用 success；MVP 不使用环形图
 * - 完成态：数字替换为「完成」+ 本次时长 +「再来一次」按钮（320ms easeOutCubic 轻微 scale 1 → 1.02 → 1 + 淡入）
 */
export function TimerDisplay({
  mode,
  phase,
  plannedSeconds,
  remainingSeconds,
  completedMinutes,
  onRestart,
}: TimerDisplayProps) {
  const { palette } = useResolvedTheme();
  const isBreak = mode !== 'focus';
  const progressRatio = computeProgressRatio(plannedSeconds, remainingSeconds);

  const progressShared = useSharedValue(progressRatio * 100);
  const completeScale = useSharedValue(1);
  const completeOpacity = useSharedValue(1);

  useEffect(() => {
    progressShared.value = withTiming(progressRatio * 100, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
  }, [progressRatio, progressShared]);

  useEffect(() => {
    if (phase === 'completed') {
      completeOpacity.value = 0;
      completeScale.value = 0.96;
      completeOpacity.value = withTiming(1, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
      completeScale.value = withSequence(
        withTiming(1.02, { duration: 180, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 140, easing: Easing.out(Easing.cubic) }),
      );
    }
  }, [phase, completeOpacity, completeScale]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, progressShared.value))}%`,
  }));

  const completeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: completeOpacity.value,
    transform: [{ scale: completeScale.value }],
  }));

  const modeLabel = mode === 'focus' ? '专注' : mode === 'short_break' ? '短休息' : '长休息';

  if (phase === 'completed') {
    return (
      <Animated.View style={completeAnimatedStyle} className="items-center py-6 px-6">
        <View
          accessible={false}
          className="w-14 h-14 rounded-full bg-surface-muted dark:bg-surface-muted-dark items-center justify-center mb-4">
          <Ionicons
            name="checkmark-outline"
            size={28}
            color={isBreak ? palette.success : palette.accent}
          />
        </View>
        <Text className="text-h1 text-ink dark:text-ink-dark mb-2">
          {isBreak ? '休息结束' : '专注完成'}
        </Text>
        <Text
          style={tabularNumsStyle}
          className="text-body text-ink-muted dark:text-ink-muted-dark mb-6">
          本次{modeLabel} {completedMinutes} 分钟
        </Text>
        <Button
          label="再来一次"
          onPress={onRestart}
          variant={isBreak ? 'success' : 'primary'}
          size="lg"
        />
      </Animated.View>
    );
  }

  return (
    <View className="items-center py-6">
      {/* 模式状态行 */}
      <View className="flex-row items-center mb-4">
        <View
          accessible={false}
          className={`w-2.5 h-2.5 rounded-full mr-2 ${
            isBreak ? 'bg-success dark:bg-success-dark' : 'bg-accent dark:bg-accent-dark'
          }`}
        />
        <Text className="text-caption text-ink-muted dark:text-ink-muted-dark">
          {phase === 'paused' ? `${modeLabel}已暂停` : modeLabel}
        </Text>
      </View>

      {/* 64/72 Display 计时数字 */}
      <Text
        style={tabularNumsStyle}
        accessibilityLiveRegion="polite"
        className={`text-display-lg tracking-tight ${
          phase === 'paused'
            ? 'text-ink-muted dark:text-ink-muted-dark'
            : 'text-ink dark:text-ink-dark'
        }`}>
        {formatTimerMMSS(remainingSeconds)}
      </Text>

      {/* 计时器下方 4px 线性进度条 */}
      <View className="w-[220px] h-[4px] rounded-full bg-surface-muted dark:bg-surface-muted-dark mt-6 overflow-hidden">
        <Animated.View
          style={barStyle}
          className={`h-full rounded-full ${
            isBreak ? 'bg-success dark:bg-success-dark' : 'bg-accent dark:bg-accent-dark'
          }`}
        />
      </View>
    </View>
  );
}
