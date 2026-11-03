import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { RadiusTokens, tabularNumsStyle } from '@/theme/tokens';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string | null;
  isAmount?: boolean;
  containerClassName?: string;
};

/**
 * Section 6.10: 输入框
 * - 默认：surface-muted 底，无边框，圆角 md (14px)，高 48
 * - 聚焦：1px accent 边框 + accent-soft 外发光（只在 Web/浅色使用，原生用边框即可）
 * - 金额输入：数字键盘，右对齐，tabular-nums，前置 ¥ 固定
 * - 错误态：danger 边框 + 下方 Caption 说明
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
  const { isDark, palette } = useResolvedTheme();

  const borderColor = error
    ? palette.danger
    : focused
      ? palette.accent
      : 'transparent';

  const webFocusGlow: ViewStyle =
    Platform.OS === 'web' && focused && !error && !isDark
      ? ({
          boxShadow: `0 0 0 3px ${palette.accentSoft}`,
        } as unknown as ViewStyle)
      : {};

  const webNoOutline: TextStyle =
    Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
        } as unknown as TextStyle)
      : {};

  return (
    <View className={containerClassName}>
      {label ? (
        <Text
          style={[styles.label, { color: palette.inkMuted }]}
          className="text-caption mb-2">
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.fieldWrapper,
          {
            backgroundColor: palette.surfaceMuted,
            borderColor,
          },
          webFocusGlow,
        ]}>
        {isAmount ? (
          <Text
            style={[
              tabularNumsStyle,
              styles.currencyPrefix,
              { color: palette.ink },
            ]}>
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
          style={[
            styles.inputBase,
            { color: palette.ink },
            isAmount ? [tabularNumsStyle, styles.amountInput] : styles.textInput,
            webNoOutline,
            style,
          ]}
        />
      </View>

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.errorText, { color: palette.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  fieldWrapper: {
    minHeight: 48,
    borderRadius: RadiusTokens.md,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
    marginRight: 8,
  },
  inputBase: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  amountInput: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
    textAlign: 'right',
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
});
