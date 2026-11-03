import { Ionicons } from '@expo/vector-icons';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect } from 'react';
import {
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
import { RadiusTokens } from '@/theme/tokens';

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

/**
 * Section 6.11 & 8.2: 底部弹层（Sheet）
 * - 顶部圆角 xl (28px)，背景 surface（实色不透明），拖拽指示条 36×4 line
 * - 遮罩 rgba(28, 25, 23, 0.35) (200ms easeOut)
 * - 弹层入场 280ms cubic-bezier(0.32, 0.72, 0, 1)，从底部向上滑出
 * - 最大高度 85%，内容超出可滚动
 */
export function Sheet({ visible, onClose, title, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useResolvedTheme();

  const translateY = useSharedValue(480);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS === 'web') return;
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

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (Platform.OS === 'web') {
    return (
      <AnimatePresence>
        {visible ? (
          <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}>
              {/* 半透明遮罩 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={onClose}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: palette.overlay,
                  backdropFilter: 'blur(2px)',
                  cursor: 'pointer',
                }}
              />

              {/* 底部实色弹层 */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{
                  duration: 0.28,
                  ease: [0.32, 0.72, 0, 1],
                }}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  maxHeight: '85vh',
                  backgroundColor: palette.surface,
                  borderTopLeftRadius: RadiusTokens.xl,
                  borderTopRightRadius: RadiusTokens.xl,
                  borderTop: `1px solid ${palette.line}`,
                  paddingLeft: 24,
                  paddingRight: 24,
                  paddingTop: 12,
                  paddingBottom: Math.max(insets.bottom, 24),
                  boxShadow: '0px -8px 28px rgba(28, 25, 23, 0.16)',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                {/* 36×4 拖拽指示条 */}
                <View accessible={false} style={styles.handleWrapper}>
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
                      onPress={onClose}
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
                  contentContainerStyle={styles.scrollContent}>
                  {children}
                </ScrollView>
              </motion.div>
            </div>
          </Modal>
        ) : null}
      </AnimatePresence>
    );
  }

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.root}>
        {/* 半透明遮罩 */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: palette.overlay },
            backdropStyle,
          ]}>
          <Pressable
            style={styles.flex1}
            onPress={onClose}
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
              paddingBottom: Math.max(insets.bottom, 24),
            },
            sheetStyle,
          ]}>
          {/* 36×4 拖拽指示条 */}
          <View accessible={false} style={styles.handleWrapper}>
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
                onPress={onClose}
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
            contentContainerStyle={styles.scrollContent}>
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
    paddingBottom: 12,
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
