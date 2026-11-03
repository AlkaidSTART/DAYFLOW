import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { BudgetSummary } from '@/features/wallet/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { formatCurrency } from '@/lib/money';
import { getCardSurfaceStyle, tabularNumsStyle } from '@/theme/tokens';

export type BudgetCardProps = {
  summary: BudgetSummary;
  onPressEditBudget: () => void;
};

export function BudgetCard({ summary, onPressEditBudget }: BudgetCardProps) {
  const { theme, palette } = useResolvedTheme();
  const hasBudget = summary.budgetCents > 0;

  const progressWidth = useSharedValue(
    hasBudget ? Math.min(100, summary.usagePercent) : 0,
  );

  useEffect(() => {
    progressWidth.value = withTiming(
      hasBudget ? Math.min(100, summary.usagePercent) : 0,
      {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      },
    );
  }, [hasBudget, summary.usagePercent, progressWidth]);

  const barAnimatedStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, progressWidth.value))}%`,
  }));

  const barColor = summary.isOverspent
    ? palette.danger
    : summary.isWarning
      ? palette.warning
      : palette.accent;

  const statusTextColorClass = summary.isOverspent
    ? 'text-danger dark:text-danger-dark font-semibold'
    : summary.isWarning
      ? 'text-warning dark:text-warning-dark font-semibold'
      : 'text-ink-muted dark:text-ink-muted-dark';

  return (
    <View style={getCardSurfaceStyle(theme)} className="rounded-xl p-5">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-caption text-ink-muted dark:text-ink-muted-dark">本月预算</Text>
        {hasBudget ? (
          <Pressable
            onPress={onPressEditBudget}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="修改本月预算"
            className="flex-row items-center py-0.5">
            <Text className="text-caption font-semibold text-accent dark:text-accent-dark">
              调整
            </Text>
          </Pressable>
        ) : null}
      </View>

      {!hasBudget ? (
        <View className="py-2">
          <Text className="text-body text-ink-muted dark:text-ink-muted-dark mb-4">
            还没有设置本月预算，设定后可查看每日建议可用额度。
          </Text>
          <View className="flex-row">
            <Button
              label="设置本月预算"
              onPress={onPressEditBudget}
              variant="primary"
              size="md"
            />
          </View>
        </View>
      ) : (
        <>
          <View className="flex-row items-baseline justify-between mb-3">
            <Text
              style={tabularNumsStyle}
              className="text-display text-ink dark:text-ink-dark">
              {formatCurrency(summary.budgetCents)}
            </Text>

            <View className="flex-row items-center">
              {summary.isOverspent ? (
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color={palette.danger}
                  style={{ marginRight: 4 }}
                />
              ) : summary.isWarning ? (
                <Ionicons
                  name="warning-outline"
                  size={16}
                  color={palette.warning}
                  style={{ marginRight: 4 }}
                />
              ) : null}
              <Text style={tabularNumsStyle} className={`text-caption ${statusTextColorClass}`}>
                已用 {summary.usagePercent}%
              </Text>
            </View>
          </View>

          {/* 进度条 */}
          <View className="h-[8px] rounded-full bg-surface-muted dark:bg-surface-muted-dark overflow-hidden mb-3">
            <Animated.View
              style={[
                {
                  height: '100%',
                  borderRadius: 999,
                  backgroundColor: barColor,
                },
                barAnimatedStyle,
              ]}
            />
          </View>

          {/* 底部说明行 */}
          {summary.isOverspent ? (
            <View className="flex-row items-center justify-between">
              <Text
                style={tabularNumsStyle}
                className="text-caption font-semibold text-danger dark:text-danger-dark">
                已超出 {formatCurrency(summary.overspentCents)}
              </Text>
              <Text
                style={tabularNumsStyle}
                className="text-caption text-ink-muted dark:text-ink-muted-dark">
                已支出 {formatCurrency(summary.spentCents)}
              </Text>
            </View>
          ) : (
            <Text
              style={tabularNumsStyle}
              className="text-caption text-ink-muted dark:text-ink-muted-dark">
              剩余 {formatCurrency(summary.remainingCents)} · 每日约{' '}
              {formatCurrency(summary.dailyAllowanceCents)}
            </Text>
          )}
        </>
      )}
    </View>
  );
}
