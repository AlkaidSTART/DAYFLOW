import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Category } from '@/features/wallet/types';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';

export type CategoryPickerProps = {
  categories: Category[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
};

/**
 * Section 6.8: 分类选择器
 * - 网格布局，每行 4 个，图标 + 名称
 * - 选中态：accent-soft 底 + accent 图标与文字
 */
export function CategoryPicker({
  categories,
  selectedCategoryId,
  onSelect,
}: CategoryPickerProps) {
  const { palette } = useResolvedTheme();

  return (
    <View>
      <Text className="text-caption text-ink-muted dark:text-ink-muted-dark mb-2">
        选择分类
      </Text>

      <View className="flex-row flex-wrap -mx-1">
        {categories.map((cat) => {
          const selected = cat.id === selectedCategoryId;
          return (
            <View key={cat.id} className="w-1/4 p-1">
              <Pressable
                onPress={() => onSelect(cat.id)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`分类：${cat.name}`}
                className={`min-h-[68px] rounded-md py-2.5 px-1 items-center justify-center ${
                  selected
                    ? 'bg-accent-soft dark:bg-accent-soft-dark'
                    : 'bg-surface-muted dark:bg-surface-muted-dark'
                }`}>
                <Ionicons
                  name={cat.icon}
                  size={22}
                  color={selected ? palette.accent : palette.ink}
                />
                <Text
                  numberOfLines={1}
                  className={`text-micro mt-1.5 ${
                    selected
                      ? 'text-accent dark:text-accent-dark font-semibold'
                      : 'text-ink dark:text-ink-dark'
                  }`}>
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
