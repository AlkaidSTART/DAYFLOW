import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sheet } from '@/components/ui/Sheet';
import { ScrollTimePicker } from '@/features/today/components/ScrollTimePicker';
import { Task, TaskDraft } from '@/features/today/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { useHaptic } from '@/lib/haptics';

export type TaskFormSheetProps = {
  visible: boolean;
  editingTask: Task | null;
  defaultIsTop3: boolean;
  currentTop3Count: number;
  onClose: () => void;
  onSave: (draft: TaskDraft) => { ok: true } | { ok: false; error: string };
  onDelete?: (task: Task) => void;
};

const CATEGORY_TAGS = ['学习', '工作', '运动', '生活'];

function parseInitialSubtitle(sub?: string) {
  if (!sub) {
    return {
      category: '',
      date: '今天' as const,
      hour: '14',
      minute: '00',
      hasTime: false,
    };
  }

  let category = '';
  let date: '今天' | '明天' = '今天';
  let hour = '14';
  let minute = '00';
  let hasTime = false;

  const parts = sub.split('·').map((s) => s.trim());
  let timeSearchTarget = sub;

  if (parts.length >= 2 && CATEGORY_TAGS.includes(parts[0])) {
    category = parts[0];
    timeSearchTarget = parts.slice(1).join('·');
  } else if (CATEGORY_TAGS.includes(parts[0])) {
    category = parts[0];
    timeSearchTarget = '';
  }

  const timeMatch = timeSearchTarget.match(/(今天|明天)?\s*(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    hasTime = true;
    if (timeMatch[1] === '明天') date = '明天';
    hour = timeMatch[2].padStart(2, '0');
    const rawMin = parseInt(timeMatch[3], 10);
    const roundedMin = Math.min(55, Math.max(0, Math.round(rawMin / 5) * 5));
    minute = roundedMin.toString().padStart(2, '0');
  }

  return { category, date, hour, minute, hasTime };
}

function assembleSubtitle(
  category: string,
  hasTime: boolean,
  date: '今天' | '明天',
  hour: string,
  minute: string,
  manualSubtitle?: string,
): string {
  if (manualSubtitle !== undefined) return manualSubtitle;
  const timePart = hasTime ? `${date} ${hour}:${minute}` : '';
  if (category && timePart) {
    return `${category} · ${timePart}`;
  }
  return category || timePart;
}

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
  const { haptic } = useHaptic();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isTop3, setIsTop3] = useState(defaultIsTop3);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // 分类与滚动时间选择状态
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState<'今天' | '明天'>('今天');
  const [selectedHour, setSelectedHour] = useState('14');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [hasTime, setHasTime] = useState(false);
  const [customSubtitle, setCustomSubtitle] = useState<string | null>(null);

  // 初始化或切换编辑任务时同步表单数据
  useEffect(() => {
    if (visible) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description ?? '');
        setIsTop3(editingTask.isTop3);

        const parsed = parseInitialSubtitle(editingTask.subtitle);
        setSelectedCategory(parsed.category);
        setSelectedDate(parsed.date);
        setSelectedHour(parsed.hour);
        setSelectedMinute(parsed.minute);
        setHasTime(parsed.hasTime);
        setCustomSubtitle(null);
      } else {
        setTitle('');
        setDescription('');
        setIsTop3(defaultIsTop3);
        setSelectedCategory('');
        setSelectedDate('今天');
        setSelectedHour('14');
        setSelectedMinute('00');
        setHasTime(false);
        setCustomSubtitle(null);
      }
      setError(null);
      setConfirmDelete(false);
    }
  }, [visible, editingTask, defaultIsTop3]);

  const otherTop3Count = editingTask?.isTop3 ? currentTop3Count - 1 : currentTop3Count;
  const top3Full = otherTop3Count >= 3;

  const currentSubtitle =
    customSubtitle !== null
      ? customSubtitle
      : assembleSubtitle(
          selectedCategory,
          hasTime,
          selectedDate,
          selectedHour,
          selectedMinute,
        );

  const handleToggleTop3 = () => {
    if (!isTop3 && top3Full) {
      setError('每日 Top 3 最多 3 条，请先取消一条重点任务');
      return;
    }
    setError(null);
    haptic('selection');
    setIsTop3(!isTop3);
  };

  const handleSelectCategory = (cat: string) => {
    haptic('selection');
    setCustomSubtitle(null);
    setSelectedCategory((prev) => (prev === cat ? '' : cat));
  };

  const handleSubmit = () => {
    const res = onSave({
      title,
      subtitle: currentSubtitle,
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

        {/* 分类快捷选择 */}
        <View>
          <Text className="text-caption font-semibold text-ink dark:text-ink-dark mb-2">
            任务分类（可选）
          </Text>
          <View className="flex-row gap-2">
            {CATEGORY_TAGS.map((tag) => {
              const isSelected = selectedCategory === tag;
              return (
                <Pressable
                  key={tag}
                  onPress={() => handleSelectCategory(tag)}
                  accessibilityRole="button"
                  accessibilityLabel={`选择分类 ${tag}`}
                  className={`px-3 py-1.5 rounded-sm border ${
                    isSelected
                      ? 'bg-accent-soft dark:bg-accent-soft-dark border-accent dark:border-accent-dark'
                      : 'bg-surface-muted dark:bg-surface-muted-dark border-transparent'
                  }`}>
                  <Text
                    className={`text-micro ${
                      isSelected
                        ? 'font-semibold text-accent dark:text-accent-dark'
                        : 'text-ink-muted dark:text-ink-muted-dark'
                    }`}>
                    {tag}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 滚动时间选择列表（带震动反馈） */}
        <View>
          <Text className="text-caption font-semibold text-ink dark:text-ink-dark mb-2">
            时间设定（可选）
          </Text>
          <ScrollTimePicker
            selectedDate={selectedDate}
            onChangeDate={(d) => {
              setCustomSubtitle(null);
              setSelectedDate(d);
            }}
            selectedHour={selectedHour}
            selectedMinute={selectedMinute}
            onChangeTime={(h, m) => {
              setCustomSubtitle(null);
              setSelectedHour(h);
              setSelectedMinute(m);
            }}
            hasTime={hasTime}
            onToggleHasTime={(ht) => {
              setCustomSubtitle(null);
              setHasTime(ht);
            }}
          />
        </View>

        {/* 预览副标题 */}
        {currentSubtitle ? (
          <View className="flex-row items-center px-3 py-2 rounded-md bg-surface-muted dark:bg-surface-muted-dark">
            <Ionicons name="information-circle-outline" size={16} color={palette.inkMuted} style={{ marginRight: 6 }} />
            <Text className="text-micro text-ink-muted dark:text-ink-muted-dark">
              提示行预览：{currentSubtitle}
            </Text>
          </View>
        ) : null}

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
