import { create } from 'zustand';

import { Task, TaskDraft } from '@/features/today/types';
import { getTodayLocalDate } from '@/lib/date';
import { createId } from '@/lib/id';

function createInitialTasks(): Task[] {
  const today = getTodayLocalDate();
  const now = Date.now();
  return [
    {
      id: 'task_top_1',
      title: '写实验报告',
      subtitle: '学习 · 今天 14:00',
      description: '整理物理实验数据与误差分析章节',
      date: today,
      isTop3: true,
      sortOrder: 1,
      completedAt: null,
      createdAt: now - 3600_000 * 3,
      updatedAt: now - 3600_000 * 3,
    },
    {
      id: 'task_top_2',
      title: '复习线性代数',
      subtitle: '学习 · 特征值与二次型',
      description: '完成课后习题第 4 章',
      date: today,
      isTop3: true,
      sortOrder: 2,
      completedAt: null,
      createdAt: now - 3600_000 * 2,
      updatedAt: now - 3600_000 * 2,
    },
    {
      id: 'task_top_3',
      title: '跑步 3 公里',
      subtitle: '运动 · 操场夜跑',
      description: '',
      date: today,
      isTop3: true,
      sortOrder: 3,
      completedAt: now - 1800_000,
      createdAt: now - 3600_000 * 4,
      updatedAt: now - 1800_000,
    },
    {
      id: 'task_other_1',
      title: '取快递',
      subtitle: '生活 · 菜鸟驿站',
      description: '',
      date: today,
      isTop3: false,
      sortOrder: 4,
      completedAt: null,
      createdAt: now - 3600_000,
      updatedAt: now - 3600_000,
    },
    {
      id: 'task_other_2',
      title: '回复导师邮件',
      subtitle: '学习 · 确认周四组会时间',
      description: '',
      date: today,
      isTop3: false,
      sortOrder: 5,
      completedAt: null,
      createdAt: now - 1200_000,
      updatedAt: now - 1200_000,
    },
  ];
}

export type TodayState = {
  tasks: Task[];
  dailyReviewNote: string;

  addTask: (draft: TaskDraft) => { ok: true; task: Task } | { ok: false; error: string };
  updateTask: (
    id: string,
    draft: TaskDraft,
  ) => { ok: true } | { ok: false; error: string };
  toggleTaskComplete: (id: string) => boolean;
  deleteTask: (id: string) => Task | null;
  restoreTask: (task: Task) => void;
  moveTaskOrder: (id: string, direction: 'up' | 'down') => void;
  setDailyReviewNote: (note: string) => void;
  clearAllTasks: () => void;
  resetSampleTasks: () => void;
};

export const useTodayStore = create<TodayState>((set, get) => ({
  tasks: createInitialTasks(),
  dailyReviewNote: '上午状态不错，先把实验报告的图表整理完了。',

  addTask: (draft) => {
    const title = draft.title.trim();
    if (!title) {
      return { ok: false, error: '请输入任务名称' };
    }
    const existing = get().tasks;
    const top3Count = existing.filter((t) => t.isTop3).length;
    if (draft.isTop3 && top3Count >= 3) {
      return { ok: false, error: '每日 Top 3 最多 3 条，请先取消一条重点任务' };
    }

    const now = Date.now();
    const maxSort = existing.reduce((max, t) => Math.max(max, t.sortOrder), 0);
    const newTask: Task = {
      id: createId('task'),
      title,
      subtitle: draft.subtitle?.trim() || undefined,
      description: draft.description?.trim() || undefined,
      date: getTodayLocalDate(),
      isTop3: draft.isTop3,
      sortOrder: maxSort + 1,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    set({ tasks: [...existing, newTask] });
    return { ok: true, task: newTask };
  },

  updateTask: (id, draft) => {
    const title = draft.title.trim();
    if (!title) {
      return { ok: false, error: '请输入任务名称' };
    }
    const existing = get().tasks;
    const otherTop3Count = existing.filter((t) => t.isTop3 && t.id !== id).length;
    if (draft.isTop3 && otherTop3Count >= 3) {
      return { ok: false, error: '每日 Top 3 最多 3 条，请先取消一条重点任务' };
    }

    const now = Date.now();
    set({
      tasks: existing.map((t) =>
        t.id === id
          ? {
              ...t,
              title,
              subtitle: draft.subtitle?.trim() || undefined,
              description: draft.description?.trim() || undefined,
              isTop3: draft.isTop3,
              updatedAt: now,
            }
          : t,
      ),
    });
    return { ok: true };
  },

  toggleTaskComplete: (id) => {
    let nowCompleted = false;
    const now = Date.now();
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== id) return t;
        nowCompleted = t.completedAt === null;
        return {
          ...t,
          completedAt: nowCompleted ? now : null,
          updatedAt: now,
        };
      }),
    }));
    return nowCompleted;
  },

  deleteTask: (id) => {
    const target = get().tasks.find((t) => t.id === id) ?? null;
    if (!target) return null;
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
    return target;
  },

  restoreTask: (task) => {
    set((state) => ({
      tasks: [...state.tasks, task].sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  },

  moveTaskOrder: (id, direction) => {
    const all = [...get().tasks];
    const target = all.find((t) => t.id === id);
    if (!target) return;

    const group = all
      .filter((t) => t.isTop3 === target.isTop3)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = group.findIndex((t) => t.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= group.length) return;

    const currentOrder = group[idx].sortOrder;
    const neighborOrder = group[swapIdx].sortOrder;
    const neighborId = group[swapIdx].id;

    set({
      tasks: all.map((t) => {
        if (t.id === id) return { ...t, sortOrder: neighborOrder };
        if (t.id === neighborId) return { ...t, sortOrder: currentOrder };
        return t;
      }),
    });
  },

  setDailyReviewNote: (dailyReviewNote) => set({ dailyReviewNote }),
  clearAllTasks: () => set({ tasks: [] }),
  resetSampleTasks: () => set({ tasks: createInitialTasks() }),
}));
