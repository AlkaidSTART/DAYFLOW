import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { useHaptic } from '@/lib/haptics';
import { RadiusTokens } from '@/theme/tokens';

export type SwipeableRowProps = {
  children: React.ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
  disabled?: boolean;
};

const ACTION_WIDTH = 84;
const SWIPE_THRESHOLD = 36;

/**
 * Section 6.2 & 6.7:
 * 支持左滑手势露出右侧 danger 删除按钮，带触觉反馈与平滑回弹（兼容 React 19 Compiler）
 */
export function SwipeableRow({
  children,
  onDelete,
  deleteLabel = '删除',
  disabled = false,
}: SwipeableRowProps) {
  const { palette } = useResolvedTheme();
  const { haptic } = useHaptic();

  const translateX = useSharedValue(0);
  const startPageX = useSharedValue(0);
  const startPageY = useSharedValue(0);
  const baseTranslateX = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const [isOpen, setIsOpen] = useState(false);

  const snapTo = (target: number, openState: boolean) => {
    translateX.value = withTiming(target, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
    setIsOpen(openState);
  };

  const handleTouchStart = (e: GestureResponderEvent) => {
    if (disabled) return;
    const touch = e.nativeEvent.touches?.[0] ?? e.nativeEvent;
    startPageX.value = touch.pageX ?? 0;
    startPageY.value = touch.pageY ?? 0;
    baseTranslateX.value = translateX.value;
    isDragging.value = false;
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    if (disabled) return;
    const touch = e.nativeEvent.touches?.[0] ?? e.nativeEvent;
    const dx = (touch.pageX ?? 0) - startPageX.value;
    const dy = (touch.pageY ?? 0) - startPageY.value;

    if (!isDragging.value) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        isDragging.value = true;
      } else {
        return;
      }
    }

    const nextX = Math.max(
      -ACTION_WIDTH - 16,
      Math.min(0, baseTranslateX.value + dx),
    );
    translateX.value = nextX;
  };

  const handleTouchEnd = (e: GestureResponderEvent) => {
    if (disabled || !isDragging.value) return;
    const touch = e.nativeEvent.changedTouches?.[0] ?? e.nativeEvent;
    const dx = (touch.pageX ?? 0) - startPageX.value;
    const finalX = baseTranslateX.value + dx;

    if (finalX < -SWIPE_THRESHOLD) {
      haptic('selection');
      snapTo(-ACTION_WIDTH, true);
    } else {
      snapTo(0, false);
    }
    isDragging.value = false;
  };

  const rowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePressDelete = () => {
    haptic('warning');
    snapTo(0, false);
    onDelete();
  };

  return (
    <View style={styles.container}>
      {/* 底层右侧删除按钮（danger 底） */}
      <View
        style={[
          styles.actionContainer,
          { backgroundColor: palette.danger },
        ]}>
        <Pressable
          onPress={handlePressDelete}
          accessibilityRole="button"
          accessibilityLabel={deleteLabel}
          style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
          <Text style={styles.deleteText}>{deleteLabel}</Text>
        </Pressable>
      </View>

      {/* 前景可滑动内容行 */}
      <Animated.View
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => snapTo(0, false)}
        style={[styles.foreground, rowAnimatedStyle]}>
        {isOpen ? (
          <Pressable
            onPress={() => snapTo(0, false)}
            accessibilityLabel="收起操作项"
            style={[StyleSheet.absoluteFill, { zIndex: 10 }]}
          />
        ) : null}
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: RadiusTokens.lg,
    overflow: 'hidden',
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: ACTION_WIDTH + 16,
    borderRadius: RadiusTokens.lg,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deleteButton: {
    width: ACTION_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  foreground: {
    width: '100%',
  },
});
