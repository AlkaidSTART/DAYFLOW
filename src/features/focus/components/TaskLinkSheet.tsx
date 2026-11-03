import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Sheet } from '@/components/ui/Sheet';
import { Task } from '@/features/today/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';

export type TaskLinkSheetProps = {
  visible: boolean;
  tasks: Task[];
  selectedTaskId: string | null;
  onSelect: (taskId: string | null) => void;
  onClose: () => void;
};

export function TaskLinkSheet({
  visible,
  tasks,
  selectedTaskId,
  onSelect,
  onClose,
}: TaskLinkSheetProps) {
  const { palette } = useResolvedTheme();
  const incompleteTasks = tasks.filter((t) => t.completedAt === null);

  return (
    <Sheet visible={visible} onClose={onClose} title="关联今日任务">
      <View className="gap-2">
        <Pressable
          onPress={() => {
            onSelect(null);
            onClose();
          }}
          accessibilityRole="radio"
          accessibilityState={{ checked: selectedTaskId === null }}
          className={`min-h-[52px] rounded-md px-4 py-3 flex-row items-center justify-between ${
            selectedTaskId === null
              ? 'bg-surface-selected dark:bg-surface-selected-dark'
              : 'bg-surface-muted dark:bg-surface-muted-dark'
          }`}>
          <Text className="text-body text-ink-muted dark:text-ink-muted-dark">
            不关联具体任务（自由专注）
          </Text>
          {selectedTaskId === null ? (
            <Ionicons name="checkmark-circle" size={20} color={palette.accent} />
          ) : null}
        </Pressable>

        {incompleteTasks.map((task) => {
          const selected = task.id === selectedTaskId;
          return (
            <Pressable
              key={task.id}
              onPress={() => {
                onSelect(task.id);
                onClose();
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              className={`min-h-[52px] rounded-md px-4 py-3 flex-row items-center justify-between ${
                selected
                  ? 'bg-surface-selected dark:bg-surface-selected-dark'
                  : 'bg-surface-muted dark:bg-surface-muted-dark'
              }`}>
              <View className="flex-1 mr-3">
                <Text className="text-body-strong text-ink dark:text-ink-dark">{task.title}</Text>
                {task.subtitle ? (
                  <Text className="text-caption text-ink-muted dark:text-ink-muted-dark mt-0.5">
                    {task.subtitle}
                  </Text>
                ) : null}
              </View>
              {selected ? (
                <Ionicons name="checkmark-circle" size={20} color={palette.accent} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
