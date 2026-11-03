import Ionicons from '@expo/vector-icons/Ionicons';
import { AnimatePresence, motion, PanInfo } from 'motion/react';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
 * Section 6.11 & 8.2: 底部弹层（Sheet - Web 端专用实现）
 * 基于 motion/react 硬件加速动画与手势
 */
export function Sheet({ visible, onClose, title, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useResolvedTheme();
  const { haptic } = useHaptic();

  const handleWebDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.y > 75 || info.velocity.y > 450) {
      haptic('selection');
      onClose();
    }
  };

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
            {/* 半透明遮罩（点击关闭） */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={() => {
                haptic('selection');
                onClose();
              }}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: palette.overlay,
                backdropFilter: 'blur(2px)',
                cursor: 'pointer',
              }}
            />

            {/* 底部实色弹层（支持向下拖拽关闭） */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.35 }}
              onDragEnd={handleWebDragEnd}
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
              {/* 36×4 拖拽指示条（可点击或下滑关闭） */}
              <Pressable
                onPress={() => {
                  haptic('selection');
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel="下滑或点击收起弹窗"
                style={styles.handleWrapper}>
                <View
                  style={[
                    styles.handleBar,
                    { backgroundColor: palette.line },
                  ]}
                />
              </Pressable>

              {title ? (
                <View style={styles.headerRow}>
                  <Text style={[styles.titleText, { color: palette.ink }]}>
                    {title}
                  </Text>
                  <Pressable
                    onPress={() => {
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

const styles = StyleSheet.create({
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
