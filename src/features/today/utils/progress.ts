import { Task, TodayProgressSummary } from '@/features/today/types';

export function computeTodayProgress(tasks: Task[]): TodayProgressSummary {
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completedAt !== null).length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const top3Tasks = tasks.filter((t) => t.isTop3);
  const top3Total = top3Tasks.length;
  const top3Completed = top3Tasks.filter((t) => t.completedAt !== null).length;
  const isAllTop3Completed = top3Total === 3 && top3Completed === 3;

  return {
    totalCount,
    completedCount,
    percentage,
    top3Total,
    top3Completed,
    isAllTop3Completed,
  };
}
