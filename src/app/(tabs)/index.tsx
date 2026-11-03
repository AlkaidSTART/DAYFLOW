import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BannerTip } from '@/components/ui/BannerTip';
import { EmptyState } from '@/components/ui/EmptyState';
import { TabPageTransition } from '@/components/ui/TabPageTransition';
import { useFocusStore } from '@/features/focus/store/focus-store';
import { useSettingsStore } from '@/features/settings/store/settings-store';
import { useVersionStore } from '@/features/settings/store/version-store';
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
import { formatVersionTag } from '@/lib/version';

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

  const currentVersion = useVersionStore((s) => s.currentVersion);
  const remoteInfo = useVersionStore((s) => s.remoteInfo);
  const isOutdated = useVersionStore((s) => s.isOutdated);
  const dismissedVersion = useVersionStore((s) => s.dismissedVersion);
  const openUpdateSheet = useVersionStore((s) => s.openUpdateSheet);
  const dismissUpdateBanner = useVersionStore((s) => s.dismissUpdateBanner);

  const showUpdateBanner =
    isOutdated &&
    remoteInfo !== null &&
    dismissedVersion !== remoteInfo.version;

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

  const handleToggleComplete = React.useCallback(
    (task: Task) => {
      const nowDone = toggleTaskComplete(task.id);
      if (nowDone) {
        // 检查是否刚刚完成了全部 Top 3
        const updatedTop3 = useTodayStore
          .getState()
          .tasks.filter((t) => t.isTop3);
        if (
          task.isTop3 &&
          updatedTop3.length === 3 &&
          updatedTop3.every((t) => t.completedAt !== null)
        ) {
          triggerHaptic('complete', hapticEnabled);
          showSnackbar('今天的重点已完成');
        } else {
          triggerHaptic('taskDone', hapticEnabled);
        }
      } else {
        triggerHaptic('selection', hapticEnabled);
      }
    },
    [toggleTaskComplete, hapticEnabled, showSnackbar],
  );

  const handleLongPressTask = React.useCallback(() => {
    setEditMode((prev) => {
      const next = !prev;
      if (next) {
        showSnackbar('已进入排序管理模式');
      }
      return next;
    });
  }, [showSnackbar]);

  const handleOpenAddTask = (isTop3: boolean) => {
    setEditingTask(null);
    setDefaultIsTop3(isTop3);
    setSheetVisible(true);
  };

  const handleOpenEditTask = React.useCallback((task: Task) => {
    setEditingTask(task);
    setDefaultIsTop3(task.isTop3);
    setSheetVisible(true);
  }, []);

  const handleSaveTask = (draft: TaskDraft) => {
    if (editingTask) {
      const res = updateTask(editingTask.id, draft);
      if (res.ok) {
        triggerHaptic('taskDone', hapticEnabled);
        showSnackbar('已更新任务');
      } else {
        triggerHaptic('warning', hapticEnabled);
      }
      return res;
    }
    const res = addTask(draft);
    if (res.ok) {
      triggerHaptic('taskDone', hapticEnabled);
      showSnackbar('已添加任务');
    } else {
      triggerHaptic('warning', hapticEnabled);
    }
    return res;
  };

  const handleDeleteTask = React.useCallback(
    (task: Task) => {
      triggerHaptic('warning', hapticEnabled);
      const removed = deleteTask(task.id);
      if (removed) {
        showSnackbar('已删除任务', () => {
          restoreTask(removed);
        });
      }
    },
    [deleteTask, hapticEnabled, restoreTask, showSnackbar],
  );

  const handleMoveOrder = React.useCallback(
    (task: Task, direction: 'up' | 'down') => {
      moveTaskOrder(task.id, direction);
    },
    [moveTaskOrder],
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={{ backgroundColor: palette.canvas }}
      className="flex-1 bg-canvas dark:bg-canvas-dark">
      <TabPageTransition routeKey="today">
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
                onPress={() => {
                  triggerHaptic('selection', hapticEnabled);
                  router.push('/settings');
                }}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={isOutdated ? '打开设置（有新版本可更新）' : '打开设置'}
                className="w-12 h-12 -mr-2 items-center justify-center rounded-full relative">
                <Ionicons name="settings-outline" size={24} color={palette.ink} />
                {isOutdated ? (
                  <View
                    accessible={false}
                    style={{ backgroundColor: palette.accent }}
                    className="w-2.5 h-2.5 rounded-full absolute top-2.5 right-2.5"
                  />
                ) : null}
              </Pressable>
            </View>

            <Text className="text-h1 text-ink dark:text-ink-dark">
              {getGreetingByHour()}
            </Text>
          </View>

          {/* 版本落后时的页面内乐观更新提示条（非强制阻断，可随时查看或关闭） */}
          {showUpdateBanner && remoteInfo ? (
            <BannerTip
              tone="accent"
              message={`发现新版本 ${formatVersionTag(remoteInfo.version)}（当前 ${formatVersionTag(currentVersion)}），可随时前往更新。`}
              actionLabel="查看更新"
              onAction={openUpdateSheet}
              onDismiss={() => dismissUpdateBanner(remoteInfo.version)}
              className="mb-6"
            />
          ) : null}

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
                onLongPressTask={handleLongPressTask}
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
                  {otherTasks.length > 0 ? (
                    <Pressable
                      onPress={() => {
                        triggerHaptic('selection', hapticEnabled);
                        setEditMode((v) => !v);
                      }}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={editMode ? '完成排序' : '排序或管理任务'}
                      className="min-h-[36px] px-2 items-center justify-center">
                      <Text
                        style={{ color: palette.accent }}
                        className="text-caption font-semibold">
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
                      onLongPress={handleLongPressTask}
                      onRequestDelete={handleDeleteTask}
                      onMoveOrder={handleMoveOrder}
                    />
                  ))}

                  {/* 列表底部的虚线添加行（Section 7.1：不使用悬浮按钮，避免遮挡） */}
                  <Pressable
                    onPress={() => {
                      triggerHaptic('selection', hapticEnabled);
                      handleOpenAddTask(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="添加任务"
                    className="min-h-[56px] rounded-lg border border-dashed border-line dark:border-line-dark px-4 py-3 flex-row items-center justify-center mt-1">
                    <Ionicons name="add-circle-outline" size={20} color={palette.accent} />
                    <Text
                      style={{ color: palette.accent }}
                      className="text-body-strong ml-2">
                      添加任务
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </TabPageTransition>

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
          triggerHaptic('taskDone', hapticEnabled);
          setDailyReviewNote(nextNote);
          showSnackbar('已保存今日复盘');
        }}
        onClose={() => setReviewVisible(false)}
      />
    </SafeAreaView>
  );
}
