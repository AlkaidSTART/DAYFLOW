import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { useFocusStore } from '@/features/focus/store/focus-store';
import { useSettingsStore } from '@/features/settings/store/settings-store';
import { DailyReviewSheet } from '@/features/today/components/DailyReviewSheet';
import { ProgressCard } from '@/features/today/components/ProgressCard';
import { TaskFormSheet } from '@/features/today/components/TaskFormSheet';
import { TaskRow } from '@/features/today/components/TaskRow';
import { TopThreeSection } from '@/features/today/components/TopThreeSection';
import { useTodayStore } from '@/features/today/store/today-store';
import { Task, TaskDraft } from '@/features/today/types';
import { computeTodayProgress } from '@/features/today/utils/progress';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { formatTodayHeaderDate, getGreetingByHour } from '@/lib/date';
import { triggerHaptic } from '@/lib/haptics';

/**
 * Section 7.1: Today 每日工作台页面
 * 页面上下结构：问候 → Top 3 → 进度与专注摘要 → 其他任务
 * 页面左右安全边距统一 24 (px-6)，区块间距 32 (gap-8)
 */
export default function TodayScreen() {
  const router = useRouter();
  const { palette } = useResolvedTheme();

  const tasks = useTodayStore((s) => s.tasks);
  const dailyReviewNote = useTodayStore((s) => s.dailyReviewNote);
  const addTask = useTodayStore((s) => s.addTask);
  const updateTask = useTodayStore((s) => s.updateTask);
  const toggleTaskComplete = useTodayStore((s) => s.toggleTaskComplete);
  const deleteTask = useTodayStore((s) => s.deleteTask);
  const restoreTask = useTodayStore((s) => s.restoreTask);
  const moveTaskOrder = useTodayStore((s) => s.moveTaskOrder);
  const setDailyReviewNote = useTodayStore((s) => s.setDailyReviewNote);

  const sessions = useFocusStore((s) => s.sessions);
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const showSnackbar = useSettingsStore((s) => s.showSnackbar);

  const [editMode, setEditMode] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultIsTop3, setDefaultIsTop3] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);

  const top3Tasks = useMemo(
    () =>
      tasks
        .filter((t) => t.isTop3)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [tasks],
  );

  const otherTasks = useMemo(
    () =>
      tasks
        .filter((t) => !t.isTop3)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [tasks],
  );

  const progress = useMemo(() => computeTodayProgress(tasks), [tasks]);

  const focusSummary = useMemo(() => {
    const completedFocus = sessions.filter(
      (s) => s.mode === 'focus' && s.status === 'completed',
    );
    const totalSeconds = completedFocus.reduce((acc, s) => acc + s.actualSeconds, 0);
    return {
      count: completedFocus.length,
      minutes: Math.round(totalSeconds / 60),
    };
  }, [sessions]);

  const handleToggleComplete = (task: Task) => {
    const nowDone = toggleTaskComplete(task.id);
    if (nowDone) {
      triggerHaptic('taskDone', hapticEnabled);
    }
  };

  const handleOpenAddTask = (isTop3: boolean) => {
    setEditingTask(null);
    setDefaultIsTop3(isTop3);
    setSheetVisible(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setDefaultIsTop3(task.isTop3);
    setSheetVisible(true);
  };

  const handleSaveTask = (draft: TaskDraft) => {
    if (editingTask) {
      const res = updateTask(editingTask.id, draft);
      if (res.ok) {
        showSnackbar('已更新任务');
      }
      return res;
    }
    const res = addTask(draft);
    if (res.ok) {
      showSnackbar('已添加任务');
    }
    return res;
  };

  const handleDeleteTask = (task: Task) => {
    triggerHaptic('warning', hapticEnabled);
    const removed = deleteTask(task.id);
    if (removed) {
      showSnackbar('已删除任务', () => {
        restoreTask(removed);
      });
    }
  };

  const handleMoveOrder = (task: Task, direction: 'up' | 'down') => {
    moveTaskOrder(task.id, direction);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas dark:bg-canvas-dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1 px-6">
        {/* 顶部日期与设置入口 */}
        <View className="pt-4 pb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-caption text-ink-muted dark:text-ink-muted-dark">
              {formatTodayHeaderDate()}
            </Text>

            <Pressable
              onPress={() => router.push('/settings')}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="打开设置"
              className="w-12 h-12 -mr-2 items-center justify-center rounded-full">
              <Ionicons name="settings-outline" size={24} color={palette.ink} />
            </Pressable>
          </View>

          <Text className="text-h1 text-ink dark:text-ink-dark">
            {getGreetingByHour()}
          </Text>
        </View>

        {tasks.length === 0 ? (
          <View className="gap-8">
            <View className="rounded-xl border border-dashed border-line dark:border-line-dark bg-surface dark:bg-surface-dark">
              <EmptyState
                icon="sunny-outline"
                description="今天还没有任务，从最重要的一件事开始。"
                actionLabel="新建第一个重点"
                onAction={() => handleOpenAddTask(true)}
              />
            </View>

            <ProgressCard
              progress={progress}
              focusSessionsCount={focusSummary.count}
              focusMinutesTotal={focusSummary.minutes}
              onPressGoFocus={() => router.push('/(tabs)/focus')}
              onPressAddTask={() => handleOpenAddTask(true)}
              onPressDailyReview={() => setReviewVisible(true)}
            />
          </View>
        ) : (
          <View className="gap-8">
            {/* 今日重点 Top 3 */}
            <TopThreeSection
              top3Tasks={top3Tasks}
              editMode={editMode}
              onToggleEditMode={() => setEditMode((v) => !v)}
              onToggleComplete={handleToggleComplete}
              onPressTask={handleOpenEditTask}
              onAddSlot={() => handleOpenAddTask(true)}
              onRequestDelete={handleDeleteTask}
              onMoveOrder={handleMoveOrder}
            />

            {/* 今日进度与专注摘要 */}
            <ProgressCard
              progress={progress}
              focusSessionsCount={focusSummary.count}
              focusMinutesTotal={focusSummary.minutes}
              onPressGoFocus={() => router.push('/(tabs)/focus')}
              onPressAddTask={() => handleOpenAddTask(false)}
              onPressDailyReview={() => setReviewVisible(true)}
            />

            {/* 其他任务区块 */}
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-h2 text-ink dark:text-ink-dark">其他任务</Text>
                {otherTasks.length > 1 ? (
                  <Pressable
                    onPress={() => setEditMode((v) => !v)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={editMode ? '完成排序' : '排序或管理任务'}
                    className="min-h-[36px] px-2 items-center justify-center">
                    <Text className="text-caption font-semibold text-accent dark:text-accent-dark">
                      {editMode ? '完成' : '管理'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <View className="gap-2">
                {otherTasks.map((task, idx) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    editMode={editMode}
                    canMoveUp={idx > 0}
                    canMoveDown={idx < otherTasks.length - 1}
                    onToggleComplete={handleToggleComplete}
                    onPress={handleOpenEditTask}
                    onRequestDelete={handleDeleteTask}
                    onMoveOrder={handleMoveOrder}
                  />
                ))}

                {/* 列表底部的虚线添加行（Section 7.1：不使用悬浮按钮，避免遮挡） */}
                <Pressable
                  onPress={() => handleOpenAddTask(false)}
                  accessibilityRole="button"
                  accessibilityLabel="添加任务"
                  className="min-h-[56px] rounded-lg border border-dashed border-line dark:border-line-dark px-4 py-3 flex-row items-center justify-center mt-1">
                  <Ionicons name="add-circle-outline" size={20} color={palette.accent} />
                  <Text className="text-body-strong text-accent dark:text-accent-dark ml-2">
                    添加任务
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 新建 / 编辑任务底部弹层 */}
      <TaskFormSheet
        visible={sheetVisible}
        editingTask={editingTask}
        defaultIsTop3={defaultIsTop3}
        currentTop3Count={top3Tasks.length}
        onClose={() => setSheetVisible(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* 今日复盘底部弹层 */}
      <DailyReviewSheet
        visible={reviewVisible}
        tasks={tasks}
        focusSessionsCount={focusSummary.count}
        focusMinutesTotal={focusSummary.minutes}
        note={dailyReviewNote}
        onSaveNote={(nextNote) => {
          setDailyReviewNote(nextNote);
          showSnackbar('已保存今日复盘');
        }}
        onClose={() => setReviewVisible(false)}
      />
    </SafeAreaView>
  );
}
