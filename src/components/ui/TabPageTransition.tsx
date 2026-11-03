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

const ROUTE_ORDER: Record<string, number> = {
  today: 0,
  focus: 1,
  wallet: 2,
};

function getIndexFromPathname(pathname: string): number {
  if (pathname.startsWith('/focus')) return 1;
  if (pathname.startsWith('/wallet')) return 2;
  return 0;
}

// 记录上一次激活的 Tab 索引，用于计算左右切换方向
let lastActiveTabIndex = 0;

/**
 * 页面视图切换方向感知动效
 * - 根据底部 Tab 左右顺序（Today -> Focus -> Wallet）自动判断滑入方向
 * - 采用 220ms cubic-bezier(0.22, 1, 0.36, 1) 位移 + 轻缩放 + 渐显，干净利落且具备空间方向感
 */
export function TabPageTransition({ routeKey, children }: TabPageTransitionProps) {
  const pathname = usePathname();
  const targetIndex = ROUTE_ORDER[routeKey] ?? getIndexFromPathname(pathname);
  const activeIndex = getIndexFromPathname(pathname);
  const isCurrentActive = targetIndex === activeIndex;

  // 计算方向：向右切换为 +1（从右侧滑入），向左切换为 -1（从左侧滑入）
  const rawDelta = activeIndex - lastActiveTabIndex;
  const direction = rawDelta === 0 ? 0 : rawDelta > 0 ? 1 : -1;

  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!isCurrentActive) return;

    const delta = activeIndex - lastActiveTabIndex;
    const dir = delta === 0 ? 0 : delta > 0 ? 1 : -1;
    lastActiveTabIndex = activeIndex;

    if (Platform.OS === 'web') return;

    opacity.value = 0;
    translateX.value = dir * 24;
    translateY.value = 6;
    scale.value = 0.985;

    const timingConfig = {
      duration: 220,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    };

    opacity.value = withTiming(1, timingConfig);
    translateX.value = withTiming(0, timingConfig);
    translateY.value = withTiming(0, timingConfig);
    scale.value = withTiming(1, timingConfig);
  }, [activeIndex, isCurrentActive, opacity, scale, translateX, translateY]);

  const nativeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (Platform.OS === 'web') {
    return (
      <motion.div
        key={`${routeKey}_${pathname}`}
        initial={{
          opacity: 0,
          x: direction * 24,
          y: 6,
          scale: 0.985,
        }}
        animate={{
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.22,
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
