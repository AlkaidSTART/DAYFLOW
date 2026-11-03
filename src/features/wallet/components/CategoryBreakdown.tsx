import React from 'react';
import { Text, View } from 'react-native';

import { CategoryStatItem } from '@/features/wallet/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { formatCurrency } from '@/lib/money';
import {
  CategoryChartColors,
  getCardSurfaceStyle,
  tabularNumsStyle,
} from '@/theme/tokens';

export type CategoryBreakdownProps = {
  items: CategoryStatItem[];
};

/**
 * Section 2.4 & 7.3: 支出分类占比
 * 分类占比使用堆叠条 + 列表，不引入环形图；按顺序使用分类图表色
 */
export function CategoryBreakdown({ items }: CategoryBreakdownProps) {
  const { theme } = useResolvedTheme();
  const chartPalette = CategoryChartColors[theme];

  if (items.length === 0) {
    return null;
  }

  const legendSummary = items
    .slice(0, 4)
    .map((item) => `${item.categoryName} ${item.percent}%`)
    .join(' · ');

  return (
    <View>
      <Text className="text-h2 text-ink dark:text-ink-dark mb-4">支出分类</Text>

      <View style={getCardSurfaceStyle(theme)} className="rounded-lg p-4">
        {/* 堆叠占比条 */}
        <View className="h-[10px] rounded-full bg-surface-muted dark:bg-surface-muted-dark overflow-hidden flex-row mb-3">
          {items.map((item, idx) => {
            const color = chartPalette[item.chartColorIndex % chartPalette.length];
            return (
              <View
                key={item.categoryId}
                style={{
                  flex: Math.max(item.ratio, 0.03),
                  backgroundColor: color,
                  marginRight: idx < items.length - 1 ? 2 : 0,
                }}
                className="h-full"
              />
            );
          })}
        </View>

        {/* 摘要行 */}
        <Text
          style={tabularNumsStyle}
          className="text-micro text-ink-muted dark:text-ink-muted-dark mb-4">
          {legendSummary}
        </Text>

        {/* 分类列表 */}
        <View className="gap-3">
          {items.map((item) => {
            const color = chartPalette[item.chartColorIndex % chartPalette.length];
            return (
              <View
                key={item.categoryId}
                className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    accessible={false}
                    style={{ backgroundColor: color }}
                    className="w-2.5 h-2.5 rounded-full mr-2.5"
                  />
                  <Text className="text-body text-ink dark:text-ink-dark">
                    {item.categoryName}
                  </Text>
                  <Text
                    style={tabularNumsStyle}
                    className="text-caption text-ink-subtle dark:text-ink-subtle-dark ml-2">
                    {item.percent}%
                  </Text>
                </View>

                <Text
                  style={tabularNumsStyle}
                  className="text-body-strong text-ink dark:text-ink-dark">
                  {formatCurrency(item.totalCents)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
