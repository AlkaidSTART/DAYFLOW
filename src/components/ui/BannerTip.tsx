import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';

export type BannerTipProps = {
  tone?: 'accent' | 'warning';
  message: string;
  onDismiss?: () => void;
  className?: string;
};

/**
 * Section 6.12: 页面内提示条
 * accent-soft 或 warning 浅底，左侧图标，右侧可关闭；不使用长驻横幅
 */
export function BannerTip({
  tone = 'accent',
  message,
  onDismiss,
  className = '',
}: BannerTipProps) {
  const { palette } = useResolvedTheme();

  const iconColor = tone === 'warning' ? palette.warning : palette.accent;
  const iconName: keyof typeof Ionicons.glyphMap =
    tone === 'warning' ? 'alert-circle-outline' : 'information-circle-outline';

  return (
    <View
      className={`flex-row items-center rounded-md px-4 py-3 bg-accent-soft dark:bg-accent-soft-dark ${className}`}>
      <Ionicons name={iconName} size={20} color={iconColor} />
      <Text className="flex-1 text-caption text-ink dark:text-ink-dark ml-2.5">{message}</Text>
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="关闭提示"
          className="ml-2 w-8 h-8 items-center justify-center">
          <Ionicons name="close-outline" size={18} color={palette.inkMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}
