import {
  Bill,
  BudgetSummary,
  Category,
  CategoryStatItem,
} from '@/features/wallet/types';

/**
 * Section 5.5 (tech-stack) & 4.3.1 (PRD):
 * 预算与分类占比纯函数计算（整数分）
 */
export function summarizeBudget(
  budgetCents: number,
  bills: Bill[],
  remainingDays: number,
  warningThresholdPercent = 80,
): BudgetSummary {
  let spentCents = 0;
  let incomeCents = 0;

  for (const bill of bills) {
    if (bill.type === 'expense') {
      spentCents += bill.amountCents;
    } else {
      incomeCents += bill.amountCents;
    }
  }

  const balanceCents = incomeCents - spentCents;
  const remainingCents = budgetCents - spentCents;
  const usageRatio = budgetCents > 0 ? spentCents / budgetCents : 0;
  const usagePercent = budgetCents > 0 ? Math.round(usageRatio * 100) : 0;

  const dailyAllowanceCents =
    budgetCents > 0 && remainingDays > 0
      ? Math.floor(Math.max(remainingCents, 0) / remainingDays)
      : 0;

  const isOverspent = budgetCents > 0 && spentCents > budgetCents;
  const isWarning =
    budgetCents > 0 && !isOverspent && usagePercent >= warningThresholdPercent;
  const overspentCents = isOverspent ? spentCents - budgetCents : 0;

  return {
    budgetCents,
    spentCents,
    incomeCents,
    balanceCents,
    remainingCents,
    usageRatio,
    usagePercent,
    dailyAllowanceCents,
    isWarning,
    isOverspent,
    overspentCents,
  };
}

export function computeCategoryBreakdown(
  bills: Bill[],
  categories: Category[],
): CategoryStatItem[] {
  const expenseBills = bills.filter((b) => b.type === 'expense');
  const totalExpense = expenseBills.reduce((acc, b) => acc + b.amountCents, 0);
  if (totalExpense <= 0) return [];

  const categoryMap = new Map<string, Category>();
  for (const c of categories) {
    categoryMap.set(c.id, c);
  }

  const sums = new Map<string, number>();
  for (const b of expenseBills) {
    sums.set(b.categoryId, (sums.get(b.categoryId) ?? 0) + b.amountCents);
  }

  const items: CategoryStatItem[] = [];
  for (const [categoryId, totalCents] of sums.entries()) {
    const cat = categoryMap.get(categoryId);
    const ratio = totalCents / totalExpense;
    items.push({
      categoryId,
      categoryName: cat?.name ?? '其他',
      icon: cat?.icon ?? 'ellipsis-horizontal-circle-outline',
      chartColorIndex: cat?.chartColorIndex ?? 7,
      totalCents,
      ratio,
      percent: Math.max(1, Math.round(ratio * 100)),
    });
  }

  return items.sort((a, b) => b.totalCents - a.totalCents);
}
