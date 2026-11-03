import { Ionicons } from '@expo/vector-icons';
import { Href, Tabs, usePathname, useRouter } from 'expo-router';
import { motion } from 'motion/react';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';

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
 * Section 5, Section 6.1 & Section 8: 底部导航（带 motion 滑动胶囊与微动效）
 * - 三个 Tab：Today / Focus / Wallet
 * - 高度遵循系统安全区；图标 24，标签 12
 * - 选中态：图标与标签使用 ink，背景胶囊使用 surface-selected（通过 motion layoutId 平滑滑动过渡）；未选中 ink-muted
 * - 不使用浮动胶囊 Tab 或自定义大圆角 Tab
 * - 切换 Tab 无触觉反馈（Section 9）
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
          paddingBottom: Math.max(insets.bottom, 8),
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
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.12 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View style={styles.pillSlot}>
                  {isFocused ? (
                    <motion.div
                      layoutId="dayflow-bottom-tab-pill"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 32,
                        mass: 0.75,
                      }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 999,
                        backgroundColor: palette.surfaceSelected,
                      }}
                    />
                  ) : null}

                  <motion.div
                    animate={{
                      scale: isFocused ? 1.08 : 1,
                      y: isFocused ? -1 : 0,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 460,
                      damping: 26,
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                    }}>
                    <Ionicons
                      name={isFocused ? tab.iconActive : tab.iconOutline}
                      size={24}
                      color={isFocused ? palette.ink : palette.inkMuted}
                    />
                  </motion.div>
                </View>

                <motion.div
                  animate={{
                    opacity: isFocused ? 1 : 0.82,
                    y: isFocused ? 0 : 1,
                  }}
                  transition={{ duration: 0.18 }}>
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isFocused ? palette.ink : palette.inkMuted,
                        fontWeight: isFocused ? '600' : '500',
                      },
                    ]}>
                    {tab.label}
                  </Text>
                </motion.div>
              </motion.div>
            ) : (
              <>
                <View
                  style={[
                    styles.pillSlot,
                    isFocused ? { backgroundColor: palette.surfaceSelected } : undefined,
                  ]}>
                  <Ionicons
                    name={isFocused ? tab.iconActive : tab.iconOutline}
                    size={24}
                    color={isFocused ? palette.ink : palette.inkMuted}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused ? palette.ink : palette.inkMuted,
                      fontWeight: isFocused ? '600' : '500',
                    },
                  ]}>
                  {tab.label}
                </Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => <DayflowBottomTabBar />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="focus" options={{ title: 'Focus' }} />
      <Tabs.Screen name="wallet" options={{ title: 'Wallet' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSlot: {
    width: 64,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
});
