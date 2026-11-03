import { LocalDate } from '@/lib/date';

export type Task = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  date: LocalDate;
  isTop3: boolean;
  sortOrder: number;
  completedAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type TaskDraft = {
  title: string;
  subtitle?: string;
  description?: string;
  isTop3: boolean;
};

export type TodayProgressSummary = {
  totalCount: number;
  completedCount: number;
  percentage: number;
  top3Total: number;
  top3Completed: number;
  isAllTop3Completed: boolean;
};
