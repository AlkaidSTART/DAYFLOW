import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { tabularNumsStyle } from '@/theme/tokens';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string | null;
  isAmount?: boolean;
  containerClassName?: string;
};

/**
 * Section 6.10: 输入框
 * 默认：surface-muted 底，无边框，圆角 md，高 48
 * 聚焦：1px accent 边框
 * 金额输入：数字键盘，右对齐，tabular-nums，前置 ¥ 固定
 * 错误态：danger 边框 + 下方 Caption 说明
 */
export function Input({
  label,
  error,
  isAmount = false,
  containerClassName = '',
  onFocus,
  onBlur,
  style,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const { palette } = useResolvedTheme();

  const borderClass = error
    ? 'border border-danger dark:border-danger-dark'
    : focused
      ? 'border border-accent dark:border-accent-dark'
      : 'border border-transparent';

  return (
    <View className={containerClassName}>
      {label ? (
        <Text className="text-caption text-ink-muted dark:text-ink-muted-dark mb-2">{label}</Text>
      ) : null}

      <View
        className={`min-h-[48px] rounded-md bg-surface-muted dark:bg-surface-muted-dark px-4 flex-row items-center ${borderClass}`}>
        {isAmount ? (
          <Text
            style={tabularNumsStyle}
            className="text-h2 text-ink dark:text-ink-dark mr-2 font-semibold">
            ¥
          </Text>
        ) : null}

        <TextInput
          {...rest}
          keyboardType={isAmount ? 'decimal-pad' : rest.keyboardType}
          placeholderTextColor={palette.inkSubtle}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          accessibilityLabel={rest.accessibilityLabel ?? label}
          style={[isAmount ? tabularNumsStyle : undefined, style]}
          className={`flex-1 py-2.5 text-ink dark:text-ink-dark ${
            isAmount ? 'text-h2 text-right font-semibold' : 'text-body'
          }`}
        />
      </View>

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          className="text-caption text-danger dark:text-danger-dark mt-1.5">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
