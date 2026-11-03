import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Task } from '@/features/today/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { getCardSurfaceStyle, tabularNumsStyle } from '@/theme/tokens';

export type TaskRowProps = {
  task: Task;
  top3Index?: number; // 1 | 2 | 3
  editMode?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onToggleComplete: (task: Task) => void;
  onPress: (task: Task) => void;
  onRequestDelete?: (task: Task) => void;
  onMoveOrder?: (task: Task, direction: 'up' | 'down') => void;
};

/**
 * Section 6.2 & 8.2: 任务行（TaskRow）
 * - 高度：最小 56，多行描述可自适应
 * - 圆角：lg（20）
 * - 背景：surface，间距 8 分隔
 * - 勾选框：24×24 圆形，边框 2px line；完成时填充 success + 白色对勾（180ms easeOutCubic 缩放弹入）
 * - 标题：Body Strong；完成后 ink-subtle + 删除线（200ms 从左到右绘制）
 * - 副标题：Caption，ink-muted，可选
 * - Top 3 标记：24×24 圆角 8 的 accent-soft 底 + accent 序号文字
 */
export const TaskRow = React.memo(function TaskRow({
  task,
  top3Index,
  editMode = false,
  canMoveUp = false,
  canMoveDown = false,
  onToggleComplete,
  onPress,
  onRequestDelete,
  onMoveOrder,
}: TaskRowProps) {
  const { theme, palette } = useResolvedTheme();
  const isCompleted = task.completedAt !== null;

  const checkScale = useSharedValue(isCompleted ? 1 : 0.8);
  const strikeProgress = useSharedValue(isCompleted ? 1 : 0);

  useEffect(() => {
    if (isCompleted) {
      checkScale.value = 0.8;
      checkScale.value = withTiming(1, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
      });
      strikeProgress.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      checkScale.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.cubic),
      });
      strikeProgress.value = withTiming(0, {
        duration: 150,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [isCompleted, checkScale, strikeProgress]);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const strikeAnimatedStyle = useAnimatedStyle(() => ({
    width: `${Math.round(strikeProgress.value * 100)}%`,
    opacity: strikeProgress.value,
  }));

  return (
    <View
      style={getCardSurfaceStyle(theme)}
      className="min-h-[56px] rounded-lg px-4 py-3 flex-row items-center">
      {/* 勾选触控区域 ≥ 48×48 */}
      <Pressable
        onPress={() => onToggleComplete(task)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
        accessibilityLabel={`${isCompleted ? '取消完成' : '完成任务'}：${task.title}`}
        hitSlop={8}
        className="w-12 h-12 -ml-2 mr-1 items-center justify-center">
        <Animated.View
          style={[
            {
              width: 24,
              height: 24,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isCompleted ? palette.success : 'transparent',
              borderWidth: isCompleted ? 0 : 2,
              borderColor: palette.line,
            },
            checkAnimatedStyle,
          ]}>
          {isCompleted ? (
            <Ionicons name="checkmark" size={15} color="#FFFFFF" />
          ) : null}
        </Animated.View>
      </Pressable>

      {/* 标题与副标题点击进入编辑 */}
      <Pressable
        onPress={() => onPress(task)}
        accessibilityRole="button"
        accessibilityLabel={`编辑任务：${task.title}`}
        className="flex-1 py-0.5 pr-2 justify-center">
        <View className="self-start relative justify-center">
          <Text
            className={`${
              isCompleted
                ? 'text-body text-ink-subtle dark:text-ink-subtle-dark'
                : 'text-body-strong text-ink dark:text-ink-dark'
            }`}>
            {task.title}
          </Text>
          {/* 200ms 从左到右绘制删除线 */}
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: 0,
                height: 1.5,
                backgroundColor: palette.inkSubtle,
              },
              strikeAnimatedStyle,
            ]}
          />
        </View>

        {task.subtitle ? (
          <Text className="text-caption text-ink-muted dark:text-ink-muted-dark mt-0.5">
            {task.subtitle}
          </Text>
        ) : null}
      </Pressable>

      {/* 右侧：编辑模式下显示排序与删除操作；常规模式下显示 Top 3 标记 */}
      {editMode ? (
        <View className="flex-row items-center gap-1">
          {onMoveOrder ? (
            <>
              <Pressable
                onPress={() => onMoveOrder(task, 'up')}
                disabled={!canMoveUp}
                accessibilityRole="button"
                accessibilityLabel="上移任务"
                className={`w-9 h-9 rounded-sm items-center justify-center bg-surface-muted dark:bg-surface-muted-dark ${
                  !canMoveUp ? 'opacity-35' : ''
                }`}>
                <Ionicons name="chevron-up-outline" size={18} color={palette.ink} />
              </Pressable>
              <Pressable
                onPress={() => onMoveOrder(task, 'down')}
                disabled={!canMoveDown}
                accessibilityRole="button"
                accessibilityLabel="下移任务"
                className={`w-9 h-9 rounded-sm items-center justify-center bg-surface-muted dark:bg-surface-muted-dark ${
                  !canMoveDown ? 'opacity-35' : ''
                }`}>
                <Ionicons name="chevron-down-outline" size={18} color={palette.ink} />
              </Pressable>
            </>
          ) : null}

          {onRequestDelete ? (
            <Pressable
              onPress={() => onRequestDelete(task)}
              accessibilityRole="button"
              accessibilityLabel={`删除任务：${task.title}`}
              className="w-9 h-9 rounded-sm items-center justify-center bg-danger dark:bg-danger-dark ml-1">
              <Ionicons name="trash-outline" size={17} color="#FFFFFF" />
            </Pressable>
          ) : null}
        </View>
      ) : top3Index ? (
        <View
          accessible={false}
          className="w-[24px] h-[24px] rounded-sm bg-accent-soft dark:bg-accent-soft-dark items-center justify-center ml-2">
          <Text
            style={tabularNumsStyle}
            className="text-micro font-semibold text-accent dark:text-accent-dark">
            {top3Index}
          </Text>
        </View>
      ) : null}
    </View>
  );
});
