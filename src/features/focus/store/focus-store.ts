import { create } from 'zustand';

import { FocusMode, FocusSession, TimerPhase } from '@/features/focus/types';
import { computeRemainingSeconds } from '@/features/focus/timer/timer-machine';
import { createId } from '@/lib/id';

export type FocusState = {
  mode: FocusMode;
  phase: TimerPhase;
  plannedSeconds: number;
  remainingSeconds: number;
  startedAt: number | null;
  targetEndAt: number | null;
  accumulatedSeconds: number;
  lastCompletedMinutes: number;
  linkedTaskId: string | null;
  sessions: FocusSession[];

  setLinkedTaskId: (taskId: string | null) => void;
  switchMode: (mode: FocusMode, durationMinutes: number) => void;
  syncIdleDuration: (durationMinutes: number) => void;
  start: (now?: number) => void;
  pause: (now?: number) => void;
  resume: (now?: number) => void;
  tick: (now?: number) => { justCompleted: boolean };
  finishEarly: (recordSession: boolean, taskTitle?: string, now?: number) => void;
  resetAfterComplete: (durationMinutes: number) => void;
  clearSessions: () => void;
};

export const useFocusStore = create<FocusState>((set, get) => ({
  mode: 'focus',
  phase: 'idle',
  plannedSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  startedAt: null,
  targetEndAt: null,
  accumulatedSeconds: 0,
  lastCompletedMinutes: 25,
  linkedTaskId: null,
  sessions: [],

  setLinkedTaskId: (linkedTaskId) => set({ linkedTaskId }),

  switchMode: (mode, durationMinutes) => {
    const secs = durationMinutes * 60;
    set({
      mode,
      phase: 'idle',
      plannedSeconds: secs,
      remainingSeconds: secs,
      startedAt: null,
      targetEndAt: null,
      accumulatedSeconds: 0,
    });
  },

  syncIdleDuration: (durationMinutes) => {
    const state = get();
    if (state.phase === 'idle') {
      const secs = durationMinutes * 60;
      set({
        plannedSeconds: secs,
        remainingSeconds: secs,
      });
    }
  },

  start: (now = Date.now()) => {
    const { plannedSeconds } = get();
    set({
      phase: 'running',
      startedAt: now,
      targetEndAt: now + plannedSeconds * 1000,
      remainingSeconds: plannedSeconds,
      accumulatedSeconds: 0,
    });
  },

  pause: (now = Date.now()) => {
    const { phase, targetEndAt, startedAt, accumulatedSeconds } = get();
    if (phase !== 'running' || !targetEndAt || !startedAt) return;
    const remaining = computeRemainingSeconds(targetEndAt, now);
    const elapsedThisRun = Math.max(0, Math.floor((now - startedAt) / 1000));
    set({
      phase: 'paused',
      remainingSeconds: remaining,
      accumulatedSeconds: accumulatedSeconds + elapsedThisRun,
      startedAt: null,
      targetEndAt: null,
    });
  },

  resume: (now = Date.now()) => {
    const { phase, remainingSeconds } = get();
    if (phase !== 'paused') return;
    set({
      phase: 'running',
      startedAt: now,
      targetEndAt: now + remainingSeconds * 1000,
    });
  },

  tick: (now = Date.now()) => {
    const { phase, targetEndAt, plannedSeconds, mode, linkedTaskId, startedAt, sessions } = get();
    if (phase !== 'running' || !targetEndAt) {
      return { justCompleted: false };
    }
    const remaining = computeRemainingSeconds(targetEndAt, now);
    if (remaining <= 0) {
      const completedMinutes = Math.max(1, Math.round(plannedSeconds / 60));
      const newSessions =
        mode === 'focus'
          ? [
              {
                id: createId('focus'),
                taskId: linkedTaskId,
                mode,
                plannedSeconds,
                actualSeconds: plannedSeconds,
                startedAt: startedAt ?? targetEndAt - plannedSeconds * 1000,
                endedAt: targetEndAt,
                status: 'completed' as const,
              },
              ...sessions,
            ]
          : sessions;

      set({
        phase: 'completed',
        remainingSeconds: 0,
        startedAt: null,
        targetEndAt: null,
        accumulatedSeconds: plannedSeconds,
        lastCompletedMinutes: completedMinutes,
        sessions: newSessions,
      });
      return { justCompleted: true };
    }

    if (remaining !== get().remainingSeconds) {
      set({ remainingSeconds: remaining });
    }
    return { justCompleted: false };
  },

  finishEarly: (recordSession, taskTitle, now = Date.now()) => {
    const {
      phase,
      mode,
      plannedSeconds,
      accumulatedSeconds,
      startedAt,
      linkedTaskId,
      sessions,
    } = get();

    const extraRunning =
      phase === 'running' && startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
    const actualSeconds = Math.min(plannedSeconds, Math.max(60, accumulatedSeconds + extraRunning));

    const nextSessions =
      recordSession && mode === 'focus'
        ? [
            {
              id: createId('focus'),
              taskId: linkedTaskId,
              taskTitleSnapshot: taskTitle,
              mode,
              plannedSeconds,
              actualSeconds,
              startedAt: startedAt ?? now - actualSeconds * 1000,
              endedAt: now,
              status: 'completed' as const,
            },
            ...sessions,
          ]
        : sessions;

    set({
      phase: 'idle',
      remainingSeconds: plannedSeconds,
      startedAt: null,
      targetEndAt: null,
      accumulatedSeconds: 0,
      sessions: nextSessions,
    });
  },

  resetAfterComplete: (durationMinutes) => {
    const secs = durationMinutes * 60;
    set({
      phase: 'idle',
      plannedSeconds: secs,
      remainingSeconds: secs,
      startedAt: null,
      targetEndAt: null,
      accumulatedSeconds: 0,
    });
  },

  clearSessions: () => set({ sessions: [] }),
}));
