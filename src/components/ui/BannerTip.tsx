import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';

export type BannerTipProps = {
  tone?: 'accent' | 'warning';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
};

/**
 * Section 6.12: 页面内提示条
 * accent-soft 或 warning 浅底，左侧图标，右侧可操作/可关闭；不使用长驻横幅
 */
export function BannerTip({
  tone = 'accent',
  message,
  actionLabel,
  onAction,
  onDismiss,
  className = '',
}: BannerTipProps) {
  const { palette } = useResolvedTheme();

  const iconColor = tone === 'warning' ? palette.warning : palette.accent;
  const iconName: keyof typeof Ionicons.glyphMap =
    tone === 'warning' ? 'alert-circle-outline' : 'information-circle-outline';

  return (
    <View
      style={{
        backgroundColor:
          tone === 'warning' ? `${palette.warning}22` : palette.accentSoft,
      }}
      className={`flex-row items-center rounded-md px-4 py-3 ${className}`}>
      <Ionicons name={iconName} size={20} color={iconColor} />
      <Text
        style={{ color: palette.ink }}
        className="flex-1 text-caption ml-2.5">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={{ backgroundColor: palette.surface }}
          className="ml-2 px-2.5 py-1 rounded-sm items-center justify-center">
          <Text
            style={{ color: iconColor }}
            className="text-caption font-semibold">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="关闭提示"
          className="ml-1.5 w-8 h-8 items-center justify-center">
          <Ionicons name="close-outline" size={18} color={palette.inkMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}
