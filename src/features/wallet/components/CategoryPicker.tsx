import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Category } from '@/features/wallet/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { useHaptic } from '@/lib/haptics';

export type CategoryPickerProps = {
  categories: Category[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
};

/**
 * Section 6.8: 分类选择器
 * - 网格布局，每行 4 个，图标 + 名称
 * - 选中态：accent-soft 底 + accent 图标与文字（带触觉反馈）
 */
export function CategoryPicker({
  categories,
  selectedCategoryId,
  onSelect,
}: CategoryPickerProps) {
  const { palette } = useResolvedTheme();
  const { haptic } = useHaptic();

  return (
    <View>
      <Text
        style={{ color: palette.inkMuted }}
        className="text-caption mb-2">
        选择分类
      </Text>

      <View className="flex-row flex-wrap -mx-1">
        {categories.map((cat) => {
          const selected = cat.id === selectedCategoryId;
          return (
            <View key={cat.id} className="w-1/4 p-1">
              <Pressable
                onPress={() => {
                  haptic('selection');
                  onSelect(cat.id);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`分类：${cat.name}`}
                style={{
                  backgroundColor: selected ? palette.accentSoft : palette.surfaceMuted,
                }}
                className="min-h-[68px] rounded-md py-2.5 px-1 items-center justify-center">
                <Ionicons
                  name={cat.icon}
                  size={22}
                  color={selected ? palette.accent : palette.ink}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    color: selected ? palette.accent : palette.ink,
                    fontWeight: selected ? '600' : '500',
                  }}
                  className="text-micro mt-1.5">
                  {cat.name}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
