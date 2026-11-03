import { Ionicons } from '@expo/vector-icons';
import { Href, Tabs, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Easing as RNEasing, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';
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

/**
 * 底部纯图标全宽导航栏
 * - 三个 Tab 等分铺满整个底部宽度
 * - 纯图标（26px）+ 无障碍标签
 * - 基于 react-native-reanimated 实现跨平台（Android / iOS / Web）原生流畅滑块过渡
 * - 胶囊滑块带有明确的圆角与内边距，动效 180ms cubic-bezier(0.22, 1, 0.36, 1)
 */
function DayflowBottomTabBar() {
  const insets = useSafeAreaInsets();
  const { palette } = useResolvedTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [barWidth, setBarWidth] = useState(0);

  // 计算当前激活的 Tab 索引
  const activeIndex = useMemo(() => {
    const idx = TAB_ITEMS.findIndex((tab) =>
      tab.matchPath === '/'
        ? pathname === '/' || pathname === '/index'
        : pathname.startsWith(tab.matchPath)
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

  // 当宽度测量完成或激活项变化时，平滑更新指示器位置
  useEffect(() => {
    if (tabWidth <= 0) return;
    const targetX = activeIndex * (tabWidth + TAB_GAP);

    if (isFirstLayout.current) {
      translateX.value = targetX;
      isFirstLayout.current = false;
    } else {
      translateX.value = withTiming(targetX, {
        duration: 180,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
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
              router.replace(tab.href);
            }
          };

          return (
            <Pressable
              key={tab.routeName}
              onPress={handlePress}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tab.label}
              style={styles.tabItem}>
              <View style={styles.iconWrapper}>
                <Ionicons
                  name={isFocused ? tab.iconActive : tab.iconOutline}
                  size={26}
                  color={isFocused ? palette.ink : palette.inkMuted}
                />
              </View>
            </Pressable>
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
        animation: 'shift',
        transitionSpec: {
          animation: 'timing',
          config: {
            duration: 220,
            easing: RNEasing.bezier(0.22, 1, 0.36, 1),
          },
        },
        sceneStyle: {
          backgroundColor: palette.canvas,
        },
        sceneStyleInterpolator: ({ current }) => ({
          sceneStyle: {
            opacity: current.progress.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [0, 1, 0],
            }),
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [-36, 0, 36],
                }),
              },
              {
                scale: current.progress.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [0.98, 1, 0.98],
                }),
              },
            ],
          },
        }),
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
