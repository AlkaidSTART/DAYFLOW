export type FocusMode = 'focus' | 'short_break' | 'long_break';

export type TimerPhase = 'idle' | 'running' | 'paused' | 'completed';

export type FocusSession = {
  id: string;
  taskId: string | null;
  taskTitleSnapshot?: string;
  mode: FocusMode;
  plannedSeconds: number;
  actualSeconds: number;
  startedAt: number;
  endedAt: number;
  status: 'completed' | 'interrupted';
};
