import React, { useEffect, useMemo, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BannerTip } from '@/components/ui/BannerTip';
import { TabPageTransition } from '@/components/ui/TabPageTransition';
import { FinishConfirmSheet } from '@/features/focus/components/FinishConfirmSheet';
import { ModeSwitch } from '@/features/focus/components/ModeSwitch';
import { TaskLinkSheet } from '@/features/focus/components/TaskLinkSheet';
import { TimerControls } from '@/features/focus/components/TimerControls';
import { TimerDisplay } from '@/features/focus/components/TimerDisplay';
import { useFocusStore } from '@/features/focus/store/focus-store';
import { FocusMode } from '@/features/focus/types';
import { useSettingsStore } from '@/features/settings/store/settings-store';
import { useTodayStore } from '@/features/today/store/today-store';
import { triggerHaptic } from '@/lib/haptics';
import { tabularNumsStyle } from '@/theme/tokens';

/**
 * Section 6.5 & 7.2: Focus 专注计时页
 * - 无滚动，竖向居中布局
 * - 顶部：模式切换；中部：计时；下部：关联任务 + 控制按钮；底部：今日统计一行
 * - 休息模式下整体主色由 accent 切换为 success，但背景不变
 */
export default function FocusScreen() {
  const mode = useFocusStore((s) => s.mode);
  const phase = useFocusStore((s) => s.phase);
  const plannedSeconds = useFocusStore((s) => s.plannedSeconds);
  const remainingSeconds = useFocusStore((s) => s.remainingSeconds);
  const lastCompletedMinutes = useFocusStore((s) => s.lastCompletedMinutes);
  const linkedTaskId = useFocusStore((s) => s.linkedTaskId);
  const sessions = useFocusStore((s) => s.sessions);

  const setLinkedTaskId = useFocusStore((s) => s.setLinkedTaskId);
  const switchMode = useFocusStore((s) => s.switchMode);
  const syncIdleDuration = useFocusStore((s) => s.syncIdleDuration);
  const start = useFocusStore((s) => s.start);
  const pause = useFocusStore((s) => s.pause);
  const resume = useFocusStore((s) => s.resume);
  const tick = useFocusStore((s) => s.tick);
  const finishEarly = useFocusStore((s) => s.finishEarly);
  const resetAfterComplete = useFocusStore((s) => s.resetAfterComplete);

  const tasks = useTodayStore((s) => s.tasks);

  const focusMinutes = useSettingsStore((s) => s.focusMinutes);
  const shortBreakMinutes = useSettingsStore((s) => s.shortBreakMinutes);
  const longBreakMinutes = useSettingsStore((s) => s.longBreakMinutes);
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const showSnackbar = useSettingsStore((s) => s.showSnackbar);

  const [taskSheetVisible, setTaskSheetVisible] = useState(false);
  const [finishSheetVisible, setFinishSheetVisible] = useState(false);
  const [modeSwitchNotice, setModeSwitchNotice] = useState<string | null>(null);

  const getDurationForMode = (targetMode: FocusMode): number => {
    if (targetMode === 'short_break') return shortBreakMinutes;
    if (targetMode === 'long_break') return longBreakMinutes;
    return focusMinutes;
  };

  // 当设置页修改时长且处于 idle 时同步
  useEffect(() => {
    syncIdleDuration(getDurationForMode(mode));
  }, [focusMinutes, shortBreakMinutes, longBreakMinutes, mode, syncIdleDuration]);

  // 250ms 时间戳刷新 & 后台恢复
  useEffect(() => {
    if (phase !== 'running') return;

    const interval = setInterval(() => {
      const { justCompleted } = tick(Date.now());
      if (justCompleted) {
        triggerHaptic('complete', hapticEnabled);
        showSnackbar('专注完成');
      }
    }, 250);

    const sub = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        const { justCompleted } = tick(Date.now());
        if (justCompleted) {
          triggerHaptic('complete', hapticEnabled);
          showSnackbar('专注完成');
        }
      }
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [phase, tick, hapticEnabled, showSnackbar]);

  const linkedTask = useMemo(
    () => tasks.find((t) => t.id === linkedTaskId) ?? null,
    [tasks, linkedTaskId],
  );

  const todayStats = useMemo(() => {
    const completed = sessions.filter(
      (s) => s.mode === 'focus' && s.status === 'completed',
    );
    const totalMinutes = Math.round(
      completed.reduce((sum, s) => sum + s.actualSeconds, 0) / 60,
    );
    return {
      count: completed.length,
      minutes: totalMinutes,
    };
  }, [sessions]);

  const handleSelectMode = (nextMode: FocusMode) => {
    if (nextMode === mode) return;
    // PRD 4.2.7: 模式切换在计时进行中不可直接生效，需先结束或确认放弃当前计时
    if (phase === 'running' || phase === 'paused') {
      triggerHaptic('warning', hapticEnabled);
      setModeSwitchNotice('计时进行中，请先结束当前计时后再切换模式');
      return;
    }
    triggerHaptic('selection', hapticEnabled);
    setModeSwitchNotice(null);
    switchMode(nextMode, getDurationForMode(nextMode));
  };

  const handleStart = () => {
    setModeSwitchNotice(null);
    triggerHaptic('start', hapticEnabled);
    start(Date.now());
  };

  const handlePause = () => {
    triggerHaptic('pause', hapticEnabled);
    pause(Date.now());
  };

  const handleResume = () => {
    triggerHaptic('start', hapticEnabled);
    resume(Date.now());
  };

  const handleSkipBreak = () => {
    triggerHaptic('selection', hapticEnabled);
    switchMode('focus', focusMinutes);
  };

  const handleTapDigits = () => {
    if (phase === 'idle') {
      handleStart();
    } else if (phase === 'running') {
      handlePause();
    } else if (phase === 'paused') {
      handleResume();
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas dark:bg-canvas-dark px-6">
      <TabPageTransition routeKey="focus">
        <View className="flex-1 justify-between py-6">
          {/* 顶部：标题 + 模式切换 */}
          <View>
            <Text className="text-h1 text-ink dark:text-ink-dark text-center mb-6">
              专注
            </Text>
            <ModeSwitch mode={mode} onSelectMode={handleSelectMode} />

            {modeSwitchNotice ? (
              <BannerTip
                tone="warning"
                message={modeSwitchNotice}
                onDismiss={() => setModeSwitchNotice(null)}
                className="mt-4"
              />
            ) : null}
          </View>

          {/* 中部：计时器与控制区（竖向居中） */}
          <View className="items-center justify-center my-auto">
            <TimerDisplay
              mode={mode}
              phase={phase}
              plannedSeconds={plannedSeconds}
              remainingSeconds={remainingSeconds}
              completedMinutes={lastCompletedMinutes}
              onRestart={() => {
                triggerHaptic('start', hapticEnabled);
                resetAfterComplete(getDurationForMode(mode));
              }}
              onTapDigits={handleTapDigits}
            />

            <TimerControls
              mode={mode}
              phase={phase}
              linkedTaskTitle={linkedTask?.title ?? null}
              onPressTaskLink={() => {
                triggerHaptic('selection', hapticEnabled);
                setTaskSheetVisible(true);
              }}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onRequestFinish={() => {
                triggerHaptic('selection', hapticEnabled);
                setFinishSheetVisible(true);
              }}
              onSkipBreak={handleSkipBreak}
            />
          </View>

          {/* 底部：时长配比与今日统计一行 */}
          <View className="items-center gap-1.5 pb-2">
            <Text
              style={tabularNumsStyle}
              className="text-caption text-ink-muted dark:text-ink-muted-dark">
              专注 {focusMinutes} 分钟 · 休息 {shortBreakMinutes} 分钟 · 长休 {longBreakMinutes} 分钟
            </Text>

            {todayStats.count === 0 ? (
              <Text className="text-micro text-ink-subtle dark:text-ink-subtle-dark">
                还没有专注记录，开始第一个 {focusMinutes} 分钟。
              </Text>
            ) : (
              <Text
                style={tabularNumsStyle}
                className="text-micro text-ink-subtle dark:text-ink-subtle-dark">
                今日已完成 {todayStats.count} 次专注 · 共 {todayStats.minutes} 分钟
              </Text>
            )}
          </View>
        </View>
      </TabPageTransition>

      {/* 关联任务选择弹层 */}
      <TaskLinkSheet
        visible={taskSheetVisible}
        tasks={tasks}
        selectedTaskId={linkedTaskId}
        onSelect={(id) => {
          triggerHaptic('selection', hapticEnabled);
          setLinkedTaskId(id);
        }}
        onClose={() => setTaskSheetVisible(false)}
      />

      {/* 结束确认弹层 */}
      <FinishConfirmSheet
        visible={finishSheetVisible}
        onClose={() => setFinishSheetVisible(false)}
        onConfirmRecord={() => {
          triggerHaptic('complete', hapticEnabled);
          finishEarly(true, linkedTask?.title, Date.now());
          showSnackbar('已记录本次专注');
        }}
        onConfirmDiscard={() => {
          triggerHaptic('warning', hapticEnabled);
          finishEarly(false, undefined, Date.now());
        }}
      />
    </SafeAreaView>
  );
}
