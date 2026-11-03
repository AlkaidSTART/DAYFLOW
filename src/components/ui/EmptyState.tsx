import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';

export type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Section 5, 6.12 & 11: 空状态
 * 简单线性图形 + 一句话说明 + 一个主按钮，禁止使用 Emoji 或 3D 图
 */
export function EmptyState({ icon, description, actionLabel, onAction }: EmptyStateProps) {
  const { palette } = useResolvedTheme();

  return (
    <View className="py-12 px-6 items-center justify-center">
      {/* 纯线性几何图形组合 */}
      <View
        accessible={false}
        className="w-16 h-16 rounded-full border border-dashed border-line dark:border-line-dark bg-surface-muted dark:bg-surface-muted-dark items-center justify-center mb-4">
        <Ionicons name={icon} size={26} color={palette.inkMuted} />
      </View>

      <Text className="text-body text-ink-muted dark:text-ink-muted-dark text-center mb-6 max-w-[260px]">
        {description}
      </Text>

      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="primary" size="md" />
      ) : null}
    </View>
  );
}
