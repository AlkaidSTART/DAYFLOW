import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
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
 * 支持左滑手势（触摸 / 鼠标拖拽）露出右侧 danger 删除按钮，带触觉反馈与平滑回弹
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
  const startXRef = useRef(0);
  const crossedThresholdRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

  const snapTo = (target: number, openState: boolean) => {
    translateX.value = withTiming(target, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
    setIsOpen(openState);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        if (disabled) return false;
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5;
      },
      onPanResponderGrant: () => {
        startXRef.current = translateX.value;
        crossedThresholdRef.current = false;
      },
      onPanResponderMove: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        const nextX = Math.max(
          -ACTION_WIDTH - 16,
          Math.min(0, startXRef.current + gestureState.dx),
        );
        translateX.value = nextX;

        if (!crossedThresholdRef.current && nextX <= -SWIPE_THRESHOLD) {
          crossedThresholdRef.current = true;
          haptic('selection');
        }
      },
      onPanResponderRelease: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        const finalX = startXRef.current + gestureState.dx;
        if (finalX < -SWIPE_THRESHOLD || gestureState.vx < -0.35) {
          snapTo(-ACTION_WIDTH, true);
        } else {
          snapTo(0, false);
        }
      },
      onPanResponderTerminate: () => {
        snapTo(0, false);
      },
    }),
  ).current;

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
        {...panResponder.panHandlers}
        style={[styles.foreground, rowAnimatedStyle]}>
        {isOpen ? (
          <Pressable
            onPress={() => snapTo(0, false)}
            accessibilityLabel="收起操作项"
            style={StyleSheet.absoluteFill}
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
