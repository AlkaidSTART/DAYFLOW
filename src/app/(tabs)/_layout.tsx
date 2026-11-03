import { Ionicons } from '@expo/vector-icons';
import { Href, Tabs, usePathname, useRouter } from 'expo-router';
import { motion } from 'motion/react';
import React from 'react';
import { Easing, Platform, Pressable, StyleSheet, View } from 'react-native';
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

/**
 * 底部纯图标全宽导航栏
 * - 三个 Tab 等分铺满整个底部宽度（flex: 1）
 * - 去除文字，仅保留 26px 图标与无障碍标签
 * - 动效采用高刚度无回弹阻尼（约 140ms 到位），干净利落不拖沓
 */
function DayflowBottomTabBar() {
  const insets = useSafeAreaInsets();
  const { palette } = useResolvedTheme();
  const router = useRouter();
  const pathname = usePathname();

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
      {TAB_ITEMS.map((tab) => {
        const isFocused =
          tab.matchPath === '/'
            ? pathname === '/' || pathname === '/index'
            : pathname.startsWith(tab.matchPath);

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
            {Platform.OS === 'web' ? (
              <motion.div
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.08, ease: 'easeOut' }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: RadiusTokens.md,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {isFocused ? (
                  <motion.div
                    layoutId="dayflow-bottom-tab-indicator"
                    transition={{
                      duration: 0.16,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: RadiusTokens.md,
                      backgroundColor: palette.surfaceSelected,
                    }}
                  />
                ) : null}

                <View style={styles.iconWrapper}>
                  <Ionicons
                    name={isFocused ? tab.iconActive : tab.iconOutline}
                    size={26}
                    color={isFocused ? palette.ink : palette.inkMuted}
                  />
                </View>
              </motion.div>
            ) : (
              <View
                style={[
                  styles.tabButtonNative,
                  isFocused
                    ? { backgroundColor: palette.surfaceSelected }
                    : undefined,
                ]}>
                <Ionicons
                  name={isFocused ? tab.iconActive : tab.iconOutline}
                  size={26}
                  color={isFocused ? palette.ink : palette.inkMuted}
                />
              </View>
            )}
          </Pressable>
        );
      })}
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
            easing: Easing.bezier(0.22, 1, 0.36, 1),
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabItem: {
    flex: 1,
    height: 48,
  },
  tabButtonNative: {
    width: '100%',
    height: '100%',
    borderRadius: RadiusTokens.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
