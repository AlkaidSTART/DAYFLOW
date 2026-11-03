import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BannerTip } from '@/components/ui/BannerTip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sheet } from '@/components/ui/Sheet';
import { TabPageTransition } from '@/components/ui/TabPageTransition';
import { useSettingsStore } from '@/features/settings/store/settings-store';
import { BillFormSheet } from '@/features/wallet/components/BillFormSheet';
import { BillRow } from '@/features/wallet/components/BillRow';
import { BudgetCard } from '@/features/wallet/components/BudgetCard';
import { BudgetFormSheet } from '@/features/wallet/components/BudgetFormSheet';
import { CategoryBreakdown } from '@/features/wallet/components/CategoryBreakdown';
import { useWalletStore } from '@/features/wallet/store/wallet-store';
import { Bill, BillDraft } from '@/features/wallet/types';
import {
  computeCategoryBreakdown,
  summarizeBudget,
} from '@/features/wallet/utils/budget';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import {
  formatMonthLabel,
  getCurrentMonthKey,
  getRemainingDaysInMonth,
} from '@/lib/date';
import { triggerHaptic } from '@/lib/haptics';
import { formatCurrency } from '@/lib/money';
import { getCardSurfaceStyle, tabularNumsStyle } from '@/theme/tokens';

/**
 * Section 7.3: Wallet 财务中心
 * - 顶部：钱包标题 + 月份下拉切换
 * - 本月预算卡（BudgetCard，支持整卡点击修改）
 * - 本月概览（收入 / 支出 / 结余）
 * - 支出分类（堆叠条 + 列表，支持点击分类筛选账单）
 * - 最近账单（点击编辑，左滑删除，支持展开全部）
 * - 右下角 FAB（72×72 内 56 圆），accent 底，加号图标，带按压缩放与震动反馈
 */
export default function WalletScreen() {
  const { theme, palette } = useResolvedTheme();

  const selectedMonth = useWalletStore((s) => s.selectedMonth);
  const budgetsByMonth = useWalletStore((s) => s.budgetsByMonth);
  const categories = useWalletStore((s) => s.categories);
  const bills = useWalletStore((s) => s.bills);
  const dismissedAlertMonths = useWalletStore((s) => s.dismissedAlertMonths);

  const setSelectedMonth = useWalletStore((s) => s.setSelectedMonth);
  const setMonthlyBudget = useWalletStore((s) => s.setMonthlyBudget);
  const addBill = useWalletStore((s) => s.addBill);
  const updateBill = useWalletStore((s) => s.updateBill);
  const deleteBill = useWalletStore((s) => s.deleteBill);
  const restoreBill = useWalletStore((s) => s.restoreBill);
  const dismissMonthAlert = useWalletStore((s) => s.dismissMonthAlert);

  const budgetThresholdPercent = useSettingsStore((s) => s.budgetThresholdPercent);
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const showSnackbar = useSettingsStore((s) => s.showSnackbar);

  const [billSheetVisible, setBillSheetVisible] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [budgetSheetVisible, setBudgetSheetVisible] = useState(false);
  const [monthSheetVisible, setMonthSheetVisible] = useState(false);
  const [showAllBills, setShowAllBills] = useState(false);
  const [filterCategoryId, setFilterCategoryId] = useState<string | null>(null);

  const fabScale = useSharedValue(1);
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const currentBudgetCents = budgetsByMonth[selectedMonth] ?? 0;
  const remainingDays = useMemo(
    () => getRemainingDaysInMonth(selectedMonth),
    [selectedMonth],
  );

  const summary = useMemo(
    () =>
      summarizeBudget(
        currentBudgetCents,
        bills,
        remainingDays,
        budgetThresholdPercent,
      ),
    [currentBudgetCents, bills, remainingDays, budgetThresholdPercent],
  );

  const categoryStats = useMemo(
    () => computeCategoryBreakdown(bills, categories),
    [bills, categories],
  );

  const categoryMap = useMemo(() => {
    const map = new Map<string, (typeof categories)[number]>();
    for (const c of categories) {
      map.set(c.id, c);
    }
    return map;
  }, [categories]);

  const filteredBills = useMemo(() => {
    if (!filterCategoryId) return bills;
    return bills.filter((b) => b.categoryId === filterCategoryId);
  }, [bills, filterCategoryId]);

  const visibleBills = useMemo(
    () => (showAllBills ? filteredBills : filteredBills.slice(0, 5)),
    [filteredBills, showAllBills],
  );

  const showThresholdAlert =
    !dismissedAlertMonths[selectedMonth] &&
    (summary.isWarning || summary.isOverspent);

  const handleOpenAddBill = () => {
    triggerHaptic('start', hapticEnabled);
    setEditingBill(null);
    setBillSheetVisible(true);
  };

  const handleOpenEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setBillSheetVisible(true);
  };

  const handleSaveBill = (draft: BillDraft) => {
    triggerHaptic('taskDone', hapticEnabled);
    if (editingBill) {
      updateBill(editingBill.id, draft);
      showSnackbar('已更新账单');
    } else {
      addBill(draft);
      showSnackbar('已记录');
    }
  };

  const handleDeleteBill = (bill: Bill) => {
    triggerHaptic('warning', hapticEnabled);
    const removed = deleteBill(bill.id);
    if (removed) {
      showSnackbar('已删除账单', () => {
        restoreBill(removed);
      });
    }
  };

  const currentMonthKey = getCurrentMonthKey();
  const activeFilterCategory = filterCategoryId
    ? categoryMap.get(filterCategoryId)
    : undefined;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas dark:bg-canvas-dark">
      <TabPageTransition routeKey="wallet">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 112 }}
          className="flex-1 px-6">
          {/* 顶部标题与月份切换 */}
          <View className="pt-4 pb-6 flex-row items-center justify-between">
            <Text className="text-h1 text-ink dark:text-ink-dark">钱包</Text>

            <Pressable
              onPress={() => {
                triggerHaptic('selection', hapticEnabled);
                setMonthSheetVisible(true);
              }}
              accessibilityRole="button"
              accessibilityLabel={`当前月份：${formatMonthLabel(selectedMonth)}，点击切换`}
              className="min-h-[40px] px-3.5 py-1.5 rounded-md bg-surface-muted dark:bg-surface-muted-dark flex-row items-center">
              <Text className="text-caption font-semibold text-ink dark:text-ink-dark mr-1">
                {formatMonthLabel(selectedMonth)}
              </Text>
              <Ionicons name="chevron-down-outline" size={16} color={palette.inkMuted} />
            </Pressable>
          </View>

          <View className="gap-8">
            {/* 预算阈值页面内提示条 */}
            {showThresholdAlert ? (
              <BannerTip
                tone="warning"
                message={
                  summary.isOverspent
                    ? `本月支出已超出预算 ${formatCurrency(summary.overspentCents)}，可随时调整预算或留意后续开支。`
                    : `本月预算已使用 ${summary.usagePercent}%，达到 ${budgetThresholdPercent}% 提醒线。`
                }
                onDismiss={() => {
                  triggerHaptic('selection', hapticEnabled);
                  dismissMonthAlert(selectedMonth);
                }}
              />
            ) : null}

            {/* 本月预算卡 */}
            <BudgetCard
              summary={summary}
              onPressEditBudget={() => setBudgetSheetVisible(true)}
            />

            {/* 本月概览 */}
            <View>
              <Text className="text-h2 text-ink dark:text-ink-dark mb-4">本月概览</Text>
              <View
                style={getCardSurfaceStyle(theme)}
                className="rounded-lg p-4 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-caption text-ink-muted dark:text-ink-muted-dark mb-1">
                    收入
                  </Text>
                  <Text
                    style={tabularNumsStyle}
                    className="text-body-strong text-success dark:text-success-dark">
                    +{formatCurrency(summary.incomeCents)}
                  </Text>
                </View>

                <View className="w-[1px] h-8 bg-line dark:bg-line-dark mx-3" />

                <View className="flex-1">
                  <Text className="text-caption text-ink-muted dark:text-ink-muted-dark mb-1">
                    支出
                  </Text>
                  <Text
                    style={tabularNumsStyle}
                    className="text-body-strong text-ink dark:text-ink-dark">
                    -{formatCurrency(summary.spentCents)}
                  </Text>
                </View>

                <View className="w-[1px] h-8 bg-line dark:bg-line-dark mx-3" />

                <View className="flex-1">
                  <Text className="text-caption text-ink-muted dark:text-ink-muted-dark mb-1">
                    结余
                  </Text>
                  <Text
                    style={tabularNumsStyle}
                    className="text-body-strong text-ink dark:text-ink-dark">
                    {formatCurrency(summary.balanceCents)}
                  </Text>
                </View>
              </View>
            </View>

            {/* 支出分类占比（堆叠条 + 列表，点击可筛选账单） */}
            <CategoryBreakdown
              items={categoryStats}
              selectedCategoryId={filterCategoryId}
              onSelectCategory={setFilterCategoryId}
            />

            {/* 最近账单 */}
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Text className="text-h2 text-ink dark:text-ink-dark">
                    {activeFilterCategory
                      ? `${activeFilterCategory.name}账单`
                      : '最近账单'}
                  </Text>
                  {activeFilterCategory ? (
                    <Pressable
                      onPress={() => {
                        triggerHaptic('selection', hapticEnabled);
                        setFilterCategoryId(null);
                      }}
                      className="ml-2 px-2 py-0.5 rounded-sm bg-accent-soft dark:bg-accent-soft-dark">
                      <Text className="text-micro font-semibold text-accent dark:text-accent-dark">
                        清除筛选
                      </Text>
                    </Pressable>
                  ) : null}
                </View>

                {filteredBills.length > 5 ? (
                  <Pressable
                    onPress={() => {
                      triggerHaptic('selection', hapticEnabled);
                      setShowAllBills((v) => !v);
                    }}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={showAllBills ? '收起账单列表' : '查看全部账单'}
                    className="min-h-[36px] px-2 items-center justify-center">
                    <Text className="text-caption font-semibold text-accent dark:text-accent-dark">
                      {showAllBills ? '收起' : `全部 (${filteredBills.length})`}
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {filteredBills.length === 0 ? (
                <View style={getCardSurfaceStyle(theme)} className="rounded-lg">
                  <EmptyState
                    icon="wallet-outline"
                    description="本月还没有账单，记下第一笔支出。"
                    actionLabel="记一笔"
                    onAction={handleOpenAddBill}
                  />
                </View>
              ) : (
                <View className="gap-2">
                  {visibleBills.map((bill) => (
                    <BillRow
                      key={bill.id}
                      bill={bill}
                      category={categoryMap.get(bill.categoryId)}
                      onPress={handleOpenEditBill}
                      onDelete={handleDeleteBill}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </TabPageTransition>

      {/* 右下角 FAB：72×72 触控区内 56×56 圆形按钮，避让底部导航 16 (Section 7.3) */}
      <View
        pointerEvents="box-none"
        className="absolute right-4 bottom-4 w-[72px] h-[72px] items-center justify-center">
        <Animated.View style={fabAnimatedStyle}>
          <Pressable
            onPress={handleOpenAddBill}
            onPressIn={() => {
              fabScale.value = withTiming(0.93, {
                duration: 100,
                easing: Easing.out(Easing.quad),
              });
            }}
            onPressOut={() => {
              fabScale.value = withTiming(1, {
                duration: 120,
                easing: Easing.out(Easing.quad),
              });
            }}
            accessibilityRole="button"
            accessibilityLabel="记一笔"
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              backgroundColor: palette.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="add" size={28} color={palette.onAccent} />
          </Pressable>
        </Animated.View>
      </View>

      {/* 记一笔 / 编辑账单弹层 */}
      <BillFormSheet
        visible={billSheetVisible}
        editingBill={editingBill}
        categories={categories}
        onClose={() => setBillSheetVisible(false)}
        onSave={handleSaveBill}
        onDelete={handleDeleteBill}
      />

      {/* 设置预算弹层 */}
      <BudgetFormSheet
        visible={budgetSheetVisible}
        currentBudgetCents={currentBudgetCents}
        onClose={() => setBudgetSheetVisible(false)}
        onSaveBudget={(cents) => {
          triggerHaptic('taskDone', hapticEnabled);
          setMonthlyBudget(selectedMonth, cents);
          showSnackbar(cents > 0 ? '已更新本月预算' : '已清除本月预算');
        }}
      />

      {/* 月份切换弹层（MVP 默认展示本月并预留扩展位） */}
      <Sheet
        visible={monthSheetVisible}
        onClose={() => setMonthSheetVisible(false)}
        title="选择月份">
        <View className="gap-2">
          <Pressable
            onPress={() => {
              triggerHaptic('selection', hapticEnabled);
              setSelectedMonth(currentMonthKey);
              setMonthSheetVisible(false);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedMonth === currentMonthKey }}
            className="min-h-[52px] rounded-md px-4 py-3 bg-surface-selected dark:bg-surface-selected-dark flex-row items-center justify-between">
            <Text className="text-body-strong text-ink dark:text-ink-dark">
              本月（{currentMonthKey}）
            </Text>
            <Ionicons name="checkmark-circle" size={20} color={palette.accent} />
          </Pressable>
          <Text className="text-micro text-ink-subtle dark:text-ink-subtle-dark px-1 mt-1">
            历史月份归档统计将在后续版本开放。
          </Text>
        </View>
      </Sheet>
    </SafeAreaView>
  );
}
