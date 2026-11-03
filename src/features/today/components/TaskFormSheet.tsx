import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sheet } from '@/components/ui/Sheet';
import { Task, TaskDraft } from '@/features/today/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';

export type TaskFormSheetProps = {
  visible: boolean;
  editingTask: Task | null;
  defaultIsTop3: boolean;
  currentTop3Count: number;
  onClose: () => void;
  onSave: (draft: TaskDraft) => { ok: true } | { ok: false; error: string };
  onDelete?: (task: Task) => void;
};

const QUICK_TAGS = ['学习 · 今天 14:00', '学习 · 图书馆', '运动 · 傍晚', '生活 · 今天'];

export function TaskFormSheet({
  visible,
  editingTask,
  defaultIsTop3,
  currentTop3Count,
  onClose,
  onSave,
  onDelete,
}: TaskFormSheetProps) {
  const { palette } = useResolvedTheme();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [isTop3, setIsTop3] = useState(defaultIsTop3);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editingTask) {
        setTitle(editingTask.title);
        setSubtitle(editingTask.subtitle ?? '');
        setDescription(editingTask.description ?? '');
        setIsTop3(editingTask.isTop3);
      } else {
        setTitle('');
        setSubtitle('');
        setDescription('');
        setIsTop3(defaultIsTop3);
      }
      setError(null);
      setConfirmDelete(false);
    }
  }, [visible, editingTask, defaultIsTop3]);

  const otherTop3Count = editingTask?.isTop3 ? currentTop3Count - 1 : currentTop3Count;
  const top3Full = otherTop3Count >= 3;

  const handleToggleTop3 = () => {
    if (!isTop3 && top3Full) {
      setError('每日 Top 3 最多 3 条，请先取消一条重点任务');
      return;
    }
    setError(null);
    setIsTop3(!isTop3);
  };

  const handleSubmit = () => {
    const res = onSave({
      title,
      subtitle,
      description,
      isTop3,
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={editingTask ? '编辑任务' : '新建任务'}>
      <View className="gap-4">
        <Input
          label="任务名称"
          placeholder="例如：写实验报告"
          value={title}
          onChangeText={(v) => {
            setTitle(v);
            if (error) setError(null);
          }}
          error={error}
          autoFocus={!editingTask}
        />

        <View>
          <Input
            label="分类与时间提示（可选）"
            placeholder="例如：学习 · 今天 14:00"
            value={subtitle}
            onChangeText={setSubtitle}
          />
          <View className="flex-row flex-wrap gap-2 mt-2">
            {QUICK_TAGS.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => setSubtitle(tag)}
                accessibilityRole="button"
                accessibilityLabel={`使用快捷标签 ${tag}`}
                className="px-2.5 py-1 rounded-sm bg-surface-muted dark:bg-surface-muted-dark">
                <Text className="text-micro text-ink-muted dark:text-ink-muted-dark">{tag}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Input
          label="备注说明（可选）"
          placeholder="补充具体步骤或目标"
          value={description}
          onChangeText={setDescription}
        />

        {/* Top 3 开关 */}
        <Pressable
          onPress={handleToggleTop3}
          accessibilityRole="switch"
          accessibilityState={{ checked: isTop3 }}
          accessibilityLabel="设为今日最重要的三件事"
          className={`min-h-[52px] rounded-md px-4 py-3 flex-row items-center justify-between ${
            isTop3
              ? 'bg-accent-soft dark:bg-accent-soft-dark border border-accent dark:border-accent-dark'
              : 'bg-surface-muted dark:bg-surface-muted-dark'
          }`}>
          <View className="flex-1 mr-3">
            <Text className="text-body-strong text-ink dark:text-ink-dark">
              设为今日重点（Top 3）
            </Text>
            <Text className="text-caption text-ink-muted dark:text-ink-muted-dark mt-0.5">
              {top3Full && !isTop3
                ? '今日 Top 3 已满 3 条'
                : '置顶展示在首页「今天最重要的三件事」'}
            </Text>
          </View>

          <View
            className={`w-6 h-6 rounded-full items-center justify-center ${
              isTop3
                ? 'bg-accent dark:bg-accent-dark'
                : 'border-2 border-line dark:border-line-dark'
            }`}>
            {isTop3 ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
          </View>
        </Pressable>

        {/* 底部操作区 */}
        {confirmDelete && editingTask && onDelete ? (
          <View className="p-4 rounded-md bg-surface-muted dark:bg-surface-muted-dark gap-3 mt-1">
            <Text className="text-caption text-ink dark:text-ink-dark">
              将删除这条任务，关联的历史专注记录仍会保留。
            </Text>
            <View className="flex-row gap-3">
              <Button
                label="取消"
                onPress={() => setConfirmDelete(false)}
                variant="secondary"
                size="md"
                className="flex-1"
              />
              <Button
                label="确认删除"
                onPress={() => {
                  onDelete(editingTask);
                  onClose();
                }}
                variant="danger"
                size="md"
                className="flex-1"
              />
            </View>
          </View>
        ) : (
          <View className="flex-row items-center gap-3 mt-2">
            {editingTask && onDelete ? (
              <Pressable
                onPress={() => setConfirmDelete(true)}
                accessibilityRole="button"
                accessibilityLabel="删除任务"
                className="h-[48px] px-4 rounded-md bg-surface-muted dark:bg-surface-muted-dark items-center justify-center">
                <Ionicons name="trash-outline" size={20} color={palette.danger} />
              </Pressable>
            ) : null}

            <Button
              label="取消"
              onPress={onClose}
              variant="secondary"
              size="md"
              className="flex-1"
            />
            <Button
              label="保存"
              onPress={handleSubmit}
              variant="primary"
              size="md"
              className="flex-1"
            />
          </View>
        )}
      </View>
    </Sheet>
  );
}
