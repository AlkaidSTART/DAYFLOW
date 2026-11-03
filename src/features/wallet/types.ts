import Ionicons from '@expo/vector-icons/Ionicons';

import { MonthKey } from '@/lib/date';

export type BillType = 'expense' | 'income';

export type Category = {
  id: string;
  name: string;
  type: BillType;
  icon: keyof typeof Ionicons.glyphMap;
  chartColorIndex: number; // 0..7 matching Section 2.4
  sortOrder: number;
};

export type Bill = {
  id: string;
  type: BillType;
  amountCents: number; // 整数分
  categoryId: string;
  note: string;
  occurredAt: number;
  createdAt: number;
  updatedAt: number;
};

export type BillDraft = {
  type: BillType;
  amountCents: number;
  categoryId: string;
  note: string;
  occurredAt: number;
};

export type BudgetSummary = {
  budgetCents: number;
  spentCents: number;
  incomeCents: number;
  balanceCents: number;
  remainingCents: number;
  usageRatio: number; // 0 ~ 1+
  usagePercent: number;
  dailyAllowanceCents: number;
  isWarning: boolean;
  isOverspent: boolean;
  overspentCents: number;
};

export type CategoryStatItem = {
  categoryId: string;
  categoryName: string;
  icon: keyof typeof Ionicons.glyphMap;
  chartColorIndex: number;
  totalCents: number;
  ratio: number;
  percent: number;
};

export type MonthOption = {
  key: MonthKey;
  label: string;
};
