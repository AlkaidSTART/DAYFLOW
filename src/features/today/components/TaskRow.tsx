import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { SwipeableRow } from '@/components/ui/SwipeableRow';
import { Task } from '@/features/today/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { useHaptic } from '@/lib/haptics';
import { getCardSurfaceStyle, tabularNumsStyle } from '@/theme/tokens';

export type TaskRowProps = {
  task: Task;
  top3Index?: number; // 1 | 2 | 3
  editMode?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onToggleComplete: (task: Task) => void;
  onPress: (task: Task) => void;
  onLongPress?: (task: Task) => void;
  onRequestDelete?: (task: Task) => void;
  onMoveOrder?: (task: Task, direction: 'up' | 'down') => void;
};

/**
 * Section 6.2 & 8.2: 任务行（TaskRow）
 * - 高度：最小 56，多行描述可自适应
 * - 圆角：lg（20）
 * - 勾选框：24×24 圆形，完成时填充 success + 白色对勾（180ms easeOutCubic 缩放弹入 + 震动反馈）
 * - 标题：Body Strong；完成后 ink-subtle + 删除线（200ms 从左到右绘制）
 * - 左滑：露出右侧 danger 删除按钮
 * - 长按：触发触觉反馈并进入排序编辑态
 */
export const TaskRow = React.memo(function TaskRow({
  task,
  top3Index,
  editMode = false,
  canMoveUp = false,
  canMoveDown = false,
  onToggleComplete,
  onPress,
  onLongPress,
  onRequestDelete,
  onMoveOrder,
}: TaskRowProps) {
  const { theme, palette } = useResolvedTheme();
  const { haptic } = useHaptic();
  const isCompleted = task.completedAt !== null;

  const checkScale = useSharedValue(isCompleted ? 1 : 0.8);
  const strikeProgress = useSharedValue(isCompleted ? 1 : 0);
  const rowScale = useSharedValue(1);

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

  const rowPressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rowScale.value }],
  }));

  const handlePressIn = () => {
    rowScale.value = withTiming(0.985, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    rowScale.value = withTiming(1, {
      duration: 120,
      easing: Easing.out(Easing.quad),
    });
  };

  const rowContent = (
    <Animated.View
      style={[
        getCardSurfaceStyle(theme, palette),
        {
          minHeight: 56,
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
        },
        rowPressAnimatedStyle,
      ]}>
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

      {/* 标题与副标题：点击进入编辑，长按进入排序 */}
      <Pressable
        onPress={() => {
          haptic('selection');
          onPress(task);
        }}
        onLongPress={() => {
          if (onLongPress) {
            haptic('longPress');
            onLongPress(task);
          }
        }}
        delayLongPress={320}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`编辑任务：${task.title}（长按可排序，左滑可删除）`}
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
                onPress={() => {
                  haptic('selection');
                  onMoveOrder(task, 'up');
                }}
                disabled={!canMoveUp}
                accessibilityRole="button"
                accessibilityLabel="上移任务"
                className={`w-9 h-9 rounded-sm items-center justify-center bg-surface-muted dark:bg-surface-muted-dark ${
                  !canMoveUp ? 'opacity-35' : ''
                }`}>
                <Ionicons name="chevron-up-outline" size={18} color={palette.ink} />
              </Pressable>
              <Pressable
                onPress={() => {
                  haptic('selection');
                  onMoveOrder(task, 'down');
                }}
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
          style={{ backgroundColor: palette.accentSoft }}
          className="w-[24px] h-[24px] rounded-sm items-center justify-center ml-2">
          <Text
            style={[tabularNumsStyle, { color: palette.accent }]}
            className="text-micro font-semibold">
            {top3Index}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );

  if (!onRequestDelete || editMode) {
    return rowContent;
  }

  return (
    <SwipeableRow onDelete={() => onRequestDelete(task)}>
      {rowContent}
    </SwipeableRow>
  );
});
