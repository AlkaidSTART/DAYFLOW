import dayjs from 'dayjs';
import { create } from 'zustand';

import { Bill, BillDraft, Category } from '@/features/wallet/types';
import { getCurrentMonthKey, MonthKey } from '@/lib/date';
import { createId } from '@/lib/id';

/**
 * Section 2.4 & PRD 4.3.3:
 * 默认分类与图表序号严格对应：
 * 1 餐饮, 2 交通, 3 学习, 4 购物, 5 娱乐, 6 日用品, 7 住宿, 8 其他
 */
export const DEFAULT_CATEGORIES: Category[] = [
  // 支出 8 类
  {
    id: 'cat_exp_food',
    name: '餐饮',
    type: 'expense',
    icon: 'restaurant-outline',
    chartColorIndex: 0,
    sortOrder: 1,
  },
  {
    id: 'cat_exp_transit',
    name: '交通',
    type: 'expense',
    icon: 'bus-outline',
    chartColorIndex: 1,
    sortOrder: 2,
  },
  {
    id: 'cat_exp_study',
    name: '学习',
    type: 'expense',
    icon: 'book-outline',
    chartColorIndex: 2,
    sortOrder: 3,
  },
  {
    id: 'cat_exp_shopping',
    name: '购物',
    type: 'expense',
    icon: 'bag-handle-outline',
    chartColorIndex: 3,
    sortOrder: 4,
  },
  {
    id: 'cat_exp_fun',
    name: '娱乐',
    type: 'expense',
    icon: 'film-outline',
    chartColorIndex: 4,
    sortOrder: 5,
  },
  {
    id: 'cat_exp_daily',
    name: '日用品',
    type: 'expense',
    icon: 'cube-outline',
    chartColorIndex: 5,
    sortOrder: 6,
  },
  {
    id: 'cat_exp_dorm',
    name: '住宿',
    type: 'expense',
    icon: 'home-outline',
    chartColorIndex: 6,
    sortOrder: 7,
  },
  {
    id: 'cat_exp_other',
    name: '其他',
    type: 'expense',
    icon: 'ellipsis-horizontal-circle-outline',
    chartColorIndex: 7,
    sortOrder: 8,
  },

  // 收入 4 类
  {
    id: 'cat_inc_allowance',
    name: '生活费',
    type: 'income',
    icon: 'wallet-outline',
    chartColorIndex: 0,
    sortOrder: 1,
  },
  {
    id: 'cat_inc_scholarship',
    name: '奖学金',
    type: 'income',
    icon: 'school-outline',
    chartColorIndex: 2,
    sortOrder: 2,
  },
  {
    id: 'cat_inc_parttime',
    name: '兼职',
    type: 'income',
    icon: 'briefcase-outline',
    chartColorIndex: 3,
    sortOrder: 3,
  },
  {
    id: 'cat_inc_other',
    name: '其他',
    type: 'income',
    icon: 'add-circle-outline',
    chartColorIndex: 7,
    sortOrder: 4,
  },
];

function createInitialBills(): Bill[] {
  const todayNoon = dayjs().hour(12).minute(30).second(0).valueOf();
  const yesterdayEve = dayjs().subtract(1, 'day').hour(19).minute(10).second(0).valueOf();
  const twoDaysAgo = dayjs().subtract(2, 'day').hour(15).minute(20).second(0).valueOf();
  const threeDaysAgo = dayjs().subtract(3, 'day').hour(10).minute(0).second(0).valueOf();
  const monthStart = dayjs().startOf('month').hour(9).minute(0).valueOf();

  return [
    {
      id: 'bill_init_1',
      type: 'expense',
      amountCents: 1800, // ¥ 18.00
      categoryId: 'cat_exp_food',
      note: '食堂午饭',
      occurredAt: todayNoon,
      createdAt: todayNoon,
      updatedAt: todayNoon,
    },
    {
      id: 'bill_init_2',
      type: 'expense',
      amountCents: 4650, // ¥ 46.50
      categoryId: 'cat_exp_daily',
      note: '超市日用品补货',
      occurredAt: yesterdayEve,
      createdAt: yesterdayEve,
      updatedAt: yesterdayEve,
    },
    {
      id: 'bill_init_3',
      type: 'expense',
      amountCents: 22320, // ¥ 223.20
      categoryId: 'cat_exp_study',
      note: '专业课教材与复习资料',
      occurredAt: twoDaysAgo,
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
    {
      id: 'bill_init_4',
      type: 'expense',
      amountCents: 32240, // ¥ 322.40
      categoryId: 'cat_exp_shopping',
      note: '换季外套',
      occurredAt: threeDaysAgo,
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo,
    },
    {
      id: 'bill_init_5',
      type: 'expense',
      amountCents: 18390, // 凑齐已用约 62%（共 ¥ 794.00）
      categoryId: 'cat_exp_food',
      note: '校园卡餐费充值',
      occurredAt: threeDaysAgo - 3600_000 * 5,
      createdAt: threeDaysAgo - 3600_000 * 5,
      updatedAt: threeDaysAgo - 3600_000 * 5,
    },
    {
      id: 'bill_init_6',
      type: 'income',
      amountCents: 200000, // +¥ 2,000.00
      categoryId: 'cat_inc_allowance',
      note: '本月生活费',
      occurredAt: monthStart,
      createdAt: monthStart,
      updatedAt: monthStart,
    },
  ];
}

export type WalletState = {
  selectedMonth: MonthKey;
  budgetsByMonth: Record<MonthKey, number>; // 单位：分
  categories: Category[];
  bills: Bill[];
  dismissedAlertMonths: Record<MonthKey, boolean>;

  setSelectedMonth: (month: MonthKey) => void;
  setMonthlyBudget: (month: MonthKey, amountCents: number) => void;
  addBill: (draft: BillDraft) => Bill;
  updateBill: (id: string, draft: BillDraft) => void;
  deleteBill: (id: string) => Bill | null;
  restoreBill: (bill: Bill) => void;
  dismissMonthAlert: (month: MonthKey) => void;
  clearAllWalletData: () => void;
  resetSampleWalletData: () => void;
};

export const useWalletStore = create<WalletState>((set, get) => {
  const currentMonth = getCurrentMonthKey();

  return {
    selectedMonth: currentMonth,
    budgetsByMonth: {
      [currentMonth]: 128000, // ¥ 1,280.00 (matching Section 6.6 & 7.3)
    },
    categories: DEFAULT_CATEGORIES,
    bills: createInitialBills(),
    dismissedAlertMonths: {},

    setSelectedMonth: (selectedMonth) => set({ selectedMonth }),

    setMonthlyBudget: (month, amountCents) =>
      set((state) => ({
        budgetsByMonth: {
          ...state.budgetsByMonth,
          [month]: Math.max(0, Math.trunc(amountCents)),
        },
      })),

    addBill: (draft) => {
      const now = Date.now();
      const newBill: Bill = {
        id: createId('bill'),
        type: draft.type,
        amountCents: Math.trunc(draft.amountCents),
        categoryId: draft.categoryId,
        note: draft.note.trim(),
        occurredAt: draft.occurredAt,
        createdAt: now,
        updatedAt: now,
      };
      set((state) => ({
        bills: [newBill, ...state.bills].sort((a, b) => b.occurredAt - a.occurredAt),
      }));
      return newBill;
    },

    updateBill: (id, draft) => {
      const now = Date.now();
      set((state) => ({
        bills: state.bills
          .map((b) =>
            b.id === id
              ? {
                  ...b,
                  type: draft.type,
                  amountCents: Math.trunc(draft.amountCents),
                  categoryId: draft.categoryId,
                  note: draft.note.trim(),
                  occurredAt: draft.occurredAt,
                  updatedAt: now,
                }
              : b,
          )
          .sort((a, b) => b.occurredAt - a.occurredAt),
      }));
    },

    deleteBill: (id) => {
      const target = get().bills.find((b) => b.id === id) ?? null;
      if (!target) return null;
      set((state) => ({
        bills: state.bills.filter((b) => b.id !== id),
      }));
      return target;
    },

    restoreBill: (bill) =>
      set((state) => ({
        bills: [...state.bills, bill].sort((a, b) => b.occurredAt - a.occurredAt),
      })),

    dismissMonthAlert: (month) =>
      set((state) => ({
        dismissedAlertMonths: {
          ...state.dismissedAlertMonths,
          [month]: true,
        },
      })),

    clearAllWalletData: () =>
      set({
        budgetsByMonth: {},
        bills: [],
      }),

    resetSampleWalletData: () => {
      const m = getCurrentMonthKey();
      set({
        selectedMonth: m,
        budgetsByMonth: { [m]: 128000 },
        bills: createInitialBills(),
        dismissedAlertMonths: {},
      });
    },
  };
});
