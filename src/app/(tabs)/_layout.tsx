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
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}>
      <View style={styles.barInner}>
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
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    width: '100%',
                    minHeight: 62,
                    paddingTop: 9,
                    paddingBottom: 9,
                    paddingLeft: 16,
                    paddingRight: 16,
                    borderRadius: 18,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}>
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
                        borderRadius: 18,
                        backgroundColor: palette.surfaceSelected,
                      }}
                    />
                  ) : null}

                  <motion.div
                    animate={{
                      scale: isFocused ? 1.06 : 1,
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
                      size={26}
                      color={isFocused ? palette.accent : palette.inkMuted}
                    />
                  </motion.div>

                  <motion.div
                    animate={{
                      opacity: isFocused ? 1 : 0.85,
                    }}
                    transition={{ duration: 0.18 }}
                    style={{ zIndex: 1 }}>
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
                    color={isFocused ? palette.accent : palette.inkMuted}
                  />
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
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
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
    paddingTop: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  barInner: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonNative: {
    width: '100%',
    minHeight: 62,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
});
