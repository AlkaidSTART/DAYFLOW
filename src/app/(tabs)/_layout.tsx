import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, Tabs, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { useHaptic } from '@/lib/haptics';
import { RadiusTokens } from '@/theme/tokens';

type TabConfig = {
  routeName: string;
  href: Href;
  matchPath: string;
  label: string;
  iconOutline: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const TAB_ITEMS: TabConfig[] = [
  {
    routeName: 'index',
    href: '/',
    matchPath: '/',
    label: 'Today',
    iconOutline: 'sunny-outline',
    iconActive: 'sunny',
  },
  {
    routeName: 'focus',
    href: '/focus',
    matchPath: '/focus',
    label: 'Focus',
    iconOutline: 'timer-outline',
    iconActive: 'timer',
  },
  {
    routeName: 'wallet',
    href: '/wallet',
    matchPath: '/wallet',
    label: 'Wallet',
    iconOutline: 'wallet-outline',
    iconActive: 'wallet',
  },
];

const TAB_GAP = 8;
const TAB_HEIGHT = 48;

type TabButtonProps = {
  tab: TabConfig;
  isFocused: boolean;
  onPress: () => void;
  palette: ReturnType<typeof useResolvedTheme>['palette'];
};

function TabButton({ tab, isFocused, onPress, palette }: TabButtonProps) {
  const iconScale = useSharedValue(1);

  useEffect(() => {
    if (isFocused) {
      iconScale.value = withSequence(
        withTiming(0.9, { duration: 60, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 80, easing: Easing.out(Easing.quad) }),
      );
    }
  }, [isFocused, iconScale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={tab.label}
      style={styles.tabItem}>
      <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
        <Ionicons
          name={isFocused ? tab.iconActive : tab.iconOutline}
          size={26}
          color={isFocused ? palette.ink : palette.inkMuted}
        />
      </Animated.View>
    </Pressable>
  );
}

/**
 * 底部纯图标全宽导航栏
 * - 三个 Tab 等分铺满整个底部宽度
 * - 纯图标（26px）+ 无障碍标签
 * - 触觉反馈：切换 Tab 时触发 selection 震动
 * - 动效升级：140ms 高敏捷贝塞尔曲线，干脆利落到位，图标带有轻弹确认反馈
 */
function DayflowBottomTabBar() {
  const insets = useSafeAreaInsets();
  const { palette } = useResolvedTheme();
  const { haptic } = useHaptic();
  const router = useRouter();
  const pathname = usePathname();

  const [barWidth, setBarWidth] = useState(0);

  // 计算当前激活的 Tab 索引
  const activeIndex = useMemo(() => {
    const idx = TAB_ITEMS.findIndex((tab) =>
      tab.matchPath === '/'
        ? pathname === '/' || pathname === '/index'
        : pathname.startsWith(tab.matchPath),
    );
    return idx >= 0 ? idx : 0;
  }, [pathname]);

  // 计算每个 Tab 项的宽度
  const tabWidth = useMemo(() => {
    if (barWidth <= 0) return 0;
    const totalGaps = TAB_GAP * (TAB_ITEMS.length - 1);
    return Math.max(0, (barWidth - totalGaps) / TAB_ITEMS.length);
  }, [barWidth]);

  const translateX = useSharedValue(0);
  const isFirstLayout = useRef(true);

  // 当宽度测量完成或激活项变化时，干脆果断更新指示器位置
  useEffect(() => {
    if (tabWidth <= 0) return;
    const targetX = activeIndex * (tabWidth + TAB_GAP);

    if (isFirstLayout.current) {
      translateX.value = targetX;
      isFirstLayout.current = false;
    } else {
      translateX.value = withTiming(targetX, {
        duration: 140,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
    }
  }, [activeIndex, tabWidth, translateX]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        styles.barContainer,
        {
          backgroundColor: palette.canvas,
          borderTopColor: palette.line,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}>
      <View
        style={styles.barInner}
        onLayout={(e) => {
          const width = e.nativeEvent.layout.width;
          if (width > 0 && Math.abs(width - barWidth) > 1) {
            setBarWidth(width);
          }
        }}>
        {tabWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                width: tabWidth,
                backgroundColor: palette.surfaceSelected,
              },
              animatedIndicatorStyle,
            ]}
          />
        ) : null}

        {TAB_ITEMS.map((tab, index) => {
          const isFocused = index === activeIndex;

          const handlePress = () => {
            if (!isFocused) {
              haptic('selection');
              router.replace(tab.href);
            }
          };

          return (
            <TabButton
              key={tab.routeName}
              tab={tab}
              isFocused={isFocused}
              onPress={handlePress}
              palette={palette}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { palette } = useResolvedTheme();

  return (
    <Tabs
      tabBar={() => <DayflowBottomTabBar />}
      screenOptions={{
        headerShown: false,
        animation: 'none',
        sceneStyle: {
          backgroundColor: palette.canvas,
        },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="focus" options={{ title: 'Focus' }} />
      <Tabs.Screen name="wallet" options={{ title: 'Wallet' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    width: '100%',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  barInner: {
    width: '100%',
    height: TAB_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: TAB_GAP,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: RadiusTokens.md,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
