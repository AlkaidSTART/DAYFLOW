import React from 'react';
import {
  AccessibilityRole,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { RadiusTokens } from '@/theme/tokens';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';
export type ButtonSize = 'lg' | 'md' | 'sm';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  leftIcon,
  accessibilityLabel,
  accessibilityRole = 'button',
  style,
  className = '',
}: ButtonProps) {
  const { palette } = useResolvedTheme();
  const scale = useSharedValue(1);
  const pressOpacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.4 : pressOpacity.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withTiming(0.97, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
    pressOpacity.value = withTiming(0.9, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
    pressOpacity.value = withTiming(1, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
  };

  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    lg: {
      height: 56,
      paddingHorizontal: 28,
      borderRadius: RadiusTokens.full,
    },
    md: {
      height: 48,
      paddingHorizontal: 20,
      borderRadius: RadiusTokens.md,
    },
    sm: {
      height: 36,
      paddingHorizontal: 14,
      borderRadius: RadiusTokens.md,
    },
  };

  const variantContainerStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: palette.accent,
    },
    secondary: {
      backgroundColor: palette.surfaceMuted,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: palette.line,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: palette.danger,
    },
    success: {
      backgroundColor: palette.success,
    },
  };

  const variantTextStyles: Record<ButtonVariant, TextStyle> = {
    primary: {
      color: palette.onAccent,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
    },
    secondary: {
      color: palette.ink,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
    },
    outline: {
      color: palette.ink,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
    },
    ghost: {
      color: palette.accent,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
    },
    danger: {
      color: '#FFFFFF',
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
    },
    success: {
      color: '#FFFFFF',
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
    },
  };

  const isFlex1 = className.includes('flex-1');

  return (
    <Animated.View
      style={[
        isFlex1 ? { flex: 1 } : undefined,
        fullWidth ? { width: '100%' } : undefined,
        animatedStyle,
        style,
      ]}
      className={className}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled }}
        hitSlop={size === 'sm' ? { top: 6, bottom: 6, left: 6, right: 6 } : undefined}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: fullWidth || isFlex1 ? '100%' : undefined,
          },
          sizeStyles[size],
          variantContainerStyles[variant],
        ]}>
        {leftIcon ? <View style={{ marginRight: 8 }}>{leftIcon}</View> : null}
        <Text style={variantTextStyles[variant]} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
