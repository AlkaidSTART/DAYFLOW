import React from 'react';
import { AccessibilityRole, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

  const sizeClasses: Record<ButtonSize, string> = {
    lg: 'h-[56px] px-7 rounded-full',
    md: 'h-[48px] px-5 rounded-md',
    sm: 'h-[36px] px-3.5 rounded-md',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-accent dark:bg-accent-dark',
    secondary: 'bg-surface-muted dark:bg-surface-muted-dark',
    outline: 'bg-transparent border border-line dark:border-line-dark',
    ghost: 'bg-transparent',
    danger: 'bg-danger dark:bg-danger-dark',
    success: 'bg-success dark:bg-success-dark',
  };

  const textClasses: Record<ButtonVariant, string> = {
    primary: 'text-on-accent dark:text-on-accent-dark text-body-strong',
    secondary: 'text-ink dark:text-ink-dark text-body-strong',
    outline: 'text-ink dark:text-ink-dark text-body-strong',
    ghost: 'text-accent dark:text-accent-dark text-caption font-semibold',
    danger: 'text-on-accent dark:text-on-accent-dark text-body-strong',
    success: 'text-on-accent dark:text-on-accent-dark text-body-strong',
  };

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      hitSlop={size === 'sm' ? { top: 6, bottom: 6, left: 6, right: 6 } : undefined}
      style={[animatedStyle, style]}
      className={`flex-row items-center justify-center ${sizeClasses[size]} ${variantClasses[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}>
      {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}
      <Text className={textClasses[variant]} numberOfLines={1}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}
