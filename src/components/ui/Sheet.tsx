import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  GestureResponderEvent,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { useHaptic } from '@/lib/haptics';
import { RadiusTokens } from '@/theme/tokens';

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

/**
 * Section 6.11 & 8.2: 底部弹层（Sheet - Native 移动端）
 * - 顶部圆角 xl (28px)，背景 surface（实色不透明），拖拽指示条 36×4 line（支持触摸下滑关闭）
 * - 遮罩 rgba(28, 25, 23, 0.35) (200ms easeOut)
 * - 弹层入场 280ms cubic-bezier(0.32, 0.72, 0, 1)，从底部向上滑出
 * - 最大高度 85%，内容超出可滚动
 */
export function Sheet({ visible, onClose, title, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useResolvedTheme();
  const { haptic } = useHaptic();

  const translateY = useSharedValue(480);
  const backdropOpacity = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const h = e.endCoordinates?.height ?? 0;
      setKeyboardHeight(h);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
      translateY.value = 480;
    }
  }, [visible, backdropOpacity, translateY]);

  const handleNativeTouchStart = (e: GestureResponderEvent) => {
    const touch = e.nativeEvent.touches?.[0] ?? e.nativeEvent;
    dragStartY.value = touch.pageY ?? 0;
  };

  const handleNativeTouchMove = (e: GestureResponderEvent) => {
    const touch = e.nativeEvent.touches?.[0] ?? e.nativeEvent;
    const dy = (touch.pageY ?? 0) - dragStartY.value;
    if (dy > 0) {
      translateY.value = dy;
    }
  };

  const handleNativeTouchEnd = (e: GestureResponderEvent) => {
    const touch = e.nativeEvent.changedTouches?.[0] ?? e.nativeEvent;
    const dy = (touch.pageY ?? 0) - dragStartY.value;
    if (dy > 72) {
      haptic('selection');
      onClose();
    } else {
      translateY.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
    }
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const windowHeight = Dimensions.get('window').height;
  const dynamicMaxHeight =
    keyboardHeight > 0
      ? Math.max(220, windowHeight - keyboardHeight - insets.top - 16)
      : '85%';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.root,
          Platform.OS === 'android' && keyboardHeight > 0
            ? { paddingBottom: keyboardHeight }
            : null,
        ]}>
        {/* 半透明遮罩 */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: palette.overlay },
            backdropStyle,
          ]}>
          <Pressable
            style={styles.flex1}
            onPress={() => {
              if (keyboardHeight > 0) {
                Keyboard.dismiss();
              } else {
                haptic('selection');
                onClose();
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="关闭弹窗"
          />
        </Animated.View>

        {/* 底部实色弹层容器 */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: palette.surface,
              borderColor: palette.line,
              maxHeight: dynamicMaxHeight,
              paddingBottom: Math.max(insets.bottom, 24),
            },
            sheetStyle,
          ]}>
          {/* 36×4 拖拽指示条 */}
          <View
            onTouchStart={handleNativeTouchStart}
            onTouchMove={handleNativeTouchMove}
            onTouchEnd={handleNativeTouchEnd}
            accessible={false}
            style={styles.handleWrapper}>
            <View
              style={[
                styles.handleBar,
                { backgroundColor: palette.line },
              ]}
            />
          </View>

          {title ? (
            <View style={styles.headerRow}>
              <Text style={[styles.titleText, { color: palette.ink }]}>
                {title}
              </Text>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  haptic('selection');
                  onClose();
                }}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="关闭"
                style={styles.closeBtn}>
                <Ionicons name="close-outline" size={24} color={palette.inkMuted} />
              </Pressable>
            </View>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={[
              styles.scrollContent,
              keyboardHeight > 0 ? { paddingBottom: 32 } : null,
            ]}>
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  flex1: {
    flex: 1,
  },
  sheetContainer: {
    width: '100%',
    maxHeight: '85%',
    borderTopLeftRadius: RadiusTokens.xl,
    borderTopRightRadius: RadiusTokens.xl,
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#1C1917',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  handleWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 999,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  scrollContent: {
    paddingBottom: 8,
  },
});
