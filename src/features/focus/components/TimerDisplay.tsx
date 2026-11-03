import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
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
  onTapDigits?: () => void;
};

export function TimerDisplay({
  mode,
  phase,
  plannedSeconds,
  remainingSeconds,
  completedMinutes,
  onRestart,
  onTapDigits,
}: TimerDisplayProps) {
  const { palette } = useResolvedTheme();
  const isBreak = mode !== 'focus';
  const progressRatio = computeProgressRatio(plannedSeconds, remainingSeconds);

  const progressShared = useSharedValue(progressRatio * 100);
  const completeScale = useSharedValue(1);
  const completeOpacity = useSharedValue(1);
  const digitScale = useSharedValue(1);

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

  const digitAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: digitScale.value }],
  }));

  const modeLabel = mode === 'focus' ? '专注' : mode === 'short_break' ? '短休息' : '长休息';

  if (phase === 'completed') {
    return (
      <Animated.View
        style={[
          { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 24 },
          completeAnimatedStyle,
        ]}>
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
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            marginRight: 8,
            backgroundColor: isBreak ? palette.success : palette.accent,
          }}
        />
        <Text className="text-caption text-ink-muted dark:text-ink-muted-dark">
          {phase === 'paused' ? `${modeLabel}已暂停` : modeLabel}
        </Text>
      </View>

      {/* 64/72 Display 计时数字（点击数字可直接开始 / 暂停 / 继续） */}
      <Pressable
        onPress={onTapDigits}
        onPressIn={() => {
          digitScale.value = withTiming(0.96, {
            duration: 100,
            easing: Easing.out(Easing.quad),
          });
        }}
        onPressOut={() => {
          digitScale.value = withTiming(1, {
            duration: 140,
            easing: Easing.out(Easing.quad),
          });
        }}
        accessibilityRole="button"
        accessibilityLabel={`倒计时 ${formatTimerMMSS(remainingSeconds)}，点击可${
          phase === 'running' ? '暂停' : '开始'
        }`}>
        <Animated.View style={digitAnimatedStyle}>
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
        </Animated.View>
      </Pressable>

      {/* 计时器下方 4px 线性进度条 */}
      <View className="w-[220px] h-[4px] rounded-full bg-surface-muted dark:bg-surface-muted-dark mt-6 overflow-hidden">
        <Animated.View
          style={[
            {
              height: '100%',
              borderRadius: 999,
              backgroundColor: isBreak ? palette.success : palette.accent,
            },
            barStyle,
          ]}
        />
      </View>
    </View>
  );
}
