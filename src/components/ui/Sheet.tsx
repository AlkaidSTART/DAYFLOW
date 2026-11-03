import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

/**
 * Section 6.11 & 8.2: 底部弹层（Sheet）
 * 顶部圆角 xl (28px)，背景 surface，拖拽指示条 36×4 line
 * 遮罩 rgba(28, 25, 23, 0.35) (200ms easeOut)
 * 弹层入场 280ms cubic-bezier(0.32, 0.72, 0, 1)
 * 最大高度 85%，内容超出可滚动
 */
export function Sheet({ visible, onClose, title, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useResolvedTheme();

  const translateY = useSharedValue(360);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
      translateY.value = withTiming(0, {
        duration: 280,
        easing: Easing.bezier(0.32, 0.72, 0, 1),
      });
    } else {
      backdropOpacity.value = 0;
      translateY.value = 360;
    }
  }, [visible, backdropOpacity, translateY]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end">
        <Animated.View
          style={[{ backgroundColor: palette.overlay }, backdropStyle]}
          className="absolute inset-0">
          <Pressable
            className="flex-1"
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="关闭弹窗"
          />
        </Animated.View>

        <Animated.View
          style={[
            sheetStyle,
            {
              maxHeight: '85%',
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
          className="bg-surface dark:bg-surface-dark rounded-t-xl px-6 pt-3 border-t border-line dark:border-line-dark">
          {/* 36×4 拖拽指示条 */}
          <View accessible={false} className="items-center pb-3">
            <View className="w-[36px] h-[4px] rounded-full bg-line dark:bg-line-dark" />
          </View>

          {title ? (
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-h2 text-ink dark:text-ink-dark">{title}</Text>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="关闭"
                className="w-10 h-10 items-center justify-center rounded-full">
                <Ionicons name="close-outline" size={24} color={palette.inkMuted} />
              </Pressable>
            </View>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 8 }}>
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
