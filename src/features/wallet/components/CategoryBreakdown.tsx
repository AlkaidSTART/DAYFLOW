import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { CategoryStatItem } from '@/features/wallet/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { useHaptic } from '@/lib/haptics';
import { formatCurrency } from '@/lib/money';
import {
  CategoryChartColors,
  getCardSurfaceStyle,
  tabularNumsStyle,
} from '@/theme/tokens';

export type CategoryBreakdownProps = {
  items: CategoryStatItem[];
  selectedCategoryId?: string | null;
  onSelectCategory?: (categoryId: string | null) => void;
};

/**
 * Section 2.4 & 7.3: 支出分类占比
 * 分类占比使用堆叠条 + 列表；支持点击分类项筛选下方账单并触发触觉反馈
 */
export function CategoryBreakdown({
  items,
  selectedCategoryId = null,
  onSelectCategory,
}: CategoryBreakdownProps) {
  const { theme, palette, chartColors } = useResolvedTheme();
  const { haptic } = useHaptic();
  const chartPalette = chartColors ?? CategoryChartColors[theme];

  if (items.length === 0) {
    return null;
  }

  const legendSummary = items
    .slice(0, 4)
    .map((item) => `${item.categoryName} ${item.percent}%`)
    .join(' · ');

  const handleToggleCategory = (categoryId: string) => {
    if (!onSelectCategory) return;
    haptic('selection');
    onSelectCategory(selectedCategoryId === categoryId ? null : categoryId);
  };

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text style={{ color: palette.ink }} className="text-h2">
          支出分类
        </Text>
        {selectedCategoryId && onSelectCategory ? (
          <Pressable
            onPress={() => {
              haptic('selection');
              onSelectCategory(null);
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="清除分类筛选"
            className="min-h-[32px] px-2 items-center justify-center">
            <Text
              style={{ color: palette.accent }}
              className="text-caption font-semibold">
              显示全部
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={getCardSurfaceStyle(theme, palette)} className="rounded-lg p-4">
        {/* 堆叠占比条 */}
        <View
          style={{ backgroundColor: palette.surfaceMuted }}
          className="h-[10px] rounded-full overflow-hidden flex-row mb-3">
          {items.map((item, idx) => {
            const color = chartPalette[item.chartColorIndex % chartPalette.length];
            const isDimmed =
              selectedCategoryId !== null && selectedCategoryId !== item.categoryId;
            return (
              <Pressable
                key={item.categoryId}
                onPress={() => handleToggleCategory(item.categoryId)}
                style={{
                  flex: Math.max(item.ratio, 0.03),
                  backgroundColor: color,
                  opacity: isDimmed ? 0.35 : 1,
                  marginRight: idx < items.length - 1 ? 2 : 0,
                }}
                className="h-full"
              />
            );
          })}
        </View>

        {/* 摘要行 */}
        <Text
          style={[tabularNumsStyle, { color: palette.inkMuted }]}
          className="text-micro mb-3">
          {legendSummary}
        </Text>

        {/* 分类列表（可点击筛选对应账单） */}
        <View className="gap-1.5">
          {items.map((item) => {
            const color = chartPalette[item.chartColorIndex % chartPalette.length];
            const isSelected = selectedCategoryId === item.categoryId;
            return (
              <Pressable
                key={item.categoryId}
                onPress={() => handleToggleCategory(item.categoryId)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${item.categoryName}，占比 ${item.percent}%，共 ${formatCurrency(item.totalCents)}，点击筛选账单`}
                style={{
                  backgroundColor: isSelected ? palette.surfaceSelected : 'transparent',
                }}
                className="flex-row items-center justify-between px-2.5 py-2 rounded-md">
                <View className="flex-row items-center">
                  <View
                    accessible={false}
                    style={{ backgroundColor: color }}
                    className="w-2.5 h-2.5 rounded-full mr-2.5"
                  />
                  <Text
                    style={{ color: palette.ink }}
                    className={`text-body ${isSelected ? 'font-semibold' : ''}`}>
                    {item.categoryName}
                  </Text>
                  <Text
                    style={[tabularNumsStyle, { color: palette.inkSubtle }]}
                    className="text-caption ml-2">
                    {item.percent}%
                  </Text>
                </View>

                <Text
                  style={[tabularNumsStyle, { color: palette.ink }]}
                  className="text-body-strong">
                  {formatCurrency(item.totalCents)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
