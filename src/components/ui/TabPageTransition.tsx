import { usePathname } from 'expo-router';
import { motion } from 'motion/react';
import React, { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type TabPageTransitionProps = {
  routeKey: string;
  children: React.ReactNode;
};

/**
 * Section 8.1 & 8.2:
 * 使用 motion 实现 Tab 页面切换时的 240ms easeOutCubic (cubic-bezier(0.33, 1, 0.68, 1))
 * opacity 0 -> 1, translateY 10 -> 0 过渡动效
 */
export function TabPageTransition({ routeKey, children }: TabPageTransitionProps) {
  const pathname = usePathname();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    opacity.value = 0;
    translateY.value = 4;
    opacity.value = withTiming(1, {
      duration: 150,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    translateY.value = withTiming(0, {
      duration: 150,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [pathname, opacity, translateY]);

  const nativeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (Platform.OS === 'web') {
    return (
      <motion.div
        key={`${routeKey}_${pathname}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.15,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
          height: '100%',
        }}>
        {children}
      </motion.div>
    );
  }

  return (
    <Animated.View style={[styles.flex1, nativeAnimatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
