import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { TaskRow } from '@/features/today/components/TaskRow';
import { Task } from '@/features/today/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { useHaptic } from '@/lib/haptics';
import { tabularNumsStyle } from '@/theme/tokens';

export type TopThreeSectionProps = {
  top3Tasks: Task[];
  editMode: boolean;
  onToggleEditMode: () => void;
  onToggleComplete: (task: Task) => void;
  onPressTask: (task: Task) => void;
  onLongPressTask: (task: Task) => void;
  onAddSlot: (slotNumber: number) => void;
  onRequestDelete: (task: Task) => void;
  onMoveOrder: (task: Task, direction: 'up' | 'down') => void;
};

/**
 * Section 6.3: 今日重点区（TopThreeSection）
 * - 区块标题：「今天最重要的三件事」+ 右侧「编辑」文字按钮
 * - 空位展示为虚线卡片：border-dashed border-line，中间 ink-subtle 提示「添加第 N 件事」
 * - 三张卡片使用相同的任务行样式，仅通过序号标记区分，不做卡片尺寸差异
 * - 全部完成时区块底部出现一行 success 小字：「今天的重点已完成」
 */
export function TopThreeSection({
  top3Tasks,
  editMode,
  onToggleEditMode,
  onToggleComplete,
  onPressTask,
  onLongPressTask,
  onAddSlot,
  onRequestDelete,
  onMoveOrder,
}: TopThreeSectionProps) {
  const { palette } = useResolvedTheme();
  const { haptic } = useHaptic();

  const slots = [0, 1, 2];
  const allThreeCompleted =
    top3Tasks.length === 3 && top3Tasks.every((t) => t.completedAt !== null);

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-h2 text-ink dark:text-ink-dark">今天最重要的三件事</Text>
        {top3Tasks.length > 0 ? (
          <Pressable
            onPress={() => {
              haptic('selection');
              onToggleEditMode();
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={editMode ? '完成编辑重点任务' : '编辑重点任务'}
            className="min-h-[36px] px-2 items-center justify-center">
            <Text
              style={{ color: palette.accent }}
              className="text-caption font-semibold">
              {editMode ? '完成' : '编辑'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="gap-2">
        {slots.map((slotIndex) => {
          const task = top3Tasks[slotIndex];
          const slotNumber = slotIndex + 1;

          if (task) {
            return (
              <TaskRow
                key={task.id}
                task={task}
                top3Index={slotNumber}
                editMode={editMode}
                canMoveUp={slotIndex > 0}
                canMoveDown={slotIndex < top3Tasks.length - 1}
                onToggleComplete={onToggleComplete}
                onPress={onPressTask}
                onLongPress={onLongPressTask}
                onRequestDelete={onRequestDelete}
                onMoveOrder={onMoveOrder}
              />
            );
          }

          return (
            <Pressable
              key={`empty_slot_${slotNumber}`}
              onPress={() => {
                haptic('selection');
                onAddSlot(slotNumber);
              }}
              accessibilityRole="button"
              accessibilityLabel={`添加第 ${slotNumber} 件重点任务`}
              className="min-h-[56px] rounded-lg border border-dashed border-line dark:border-line-dark px-4 py-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="add-outline" size={20} color={palette.inkSubtle} />
                <Text className="text-body text-ink-subtle dark:text-ink-subtle-dark ml-2">
                  添加第 {slotNumber} 件事
                </Text>
              </View>
              <View
                accessible={false}
                className="w-[24px] h-[24px] rounded-sm bg-surface-muted dark:bg-surface-muted-dark items-center justify-center">
                <Text
                  style={tabularNumsStyle}
                  className="text-micro font-semibold text-ink-subtle dark:text-ink-subtle-dark">
                  {slotNumber}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {allThreeCompleted ? (
        <View className="flex-row items-center mt-3 px-1">
          <Ionicons name="checkmark-circle-outline" size={16} color={palette.success} />
          <Text className="text-caption text-success dark:text-success-dark ml-1.5">
            今天的重点已完成
          </Text>
        </View>
      ) : null}
    </View>
  );
}
