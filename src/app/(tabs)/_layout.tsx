import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResolvedTheme } from '@/hooks/use-resolved-theme';

type TabConfig = {
  routeName: string;
  label: string;
  iconOutline: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const TAB_ITEMS: TabConfig[] = [
  {
    routeName: 'index',
    label: 'Today',
    iconOutline: 'sunny-outline',
    iconActive: 'sunny',
  },
  {
    routeName: 'focus',
    label: 'Focus',
    iconOutline: 'timer-outline',
    iconActive: 'timer',
  },
  {
    routeName: 'wallet',
    label: 'Wallet',
    iconOutline: 'wallet-outline',
    iconActive: 'wallet',
  },
];

/**
 * Section 5 & Section 6.1: 底部导航
 * - 三个 Tab：Today / Focus / Wallet，使用原生风格底部导航
 * - 高度遵循系统安全区；图标 24，标签 12
 * - 选中态：图标与标签使用 ink，背景胶囊使用 surface-selected；未选中 ink-muted
 * - 不使用浮动胶囊 Tab 或自定义大圆角 Tab
 * - 切换 Tab 无触觉反馈（Section 9）
 */
function DayflowBottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useResolvedTheme();

  return (
    <View
      style={{
        paddingBottom: Math.max(insets.bottom, 8),
      }}
      className="bg-canvas dark:bg-canvas-dark border-t border-line dark:border-line-dark pt-2 px-4 flex-row items-center justify-around">
      {TAB_ITEMS.map((tab, index) => {
        const route = state.routes.find((r) => r.name === tab.routeName) ?? state.routes[index];
        const isFocused = state.index === index;

        const handlePress = () => {
          if (!route) return;
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={tab.routeName}
            onPress={handlePress}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={tab.label}
            className="flex-1 min-h-[52px] items-center justify-center">
            <View
              className={`w-16 h-8 rounded-full items-center justify-center mb-1 ${
                isFocused
                  ? 'bg-surface-selected dark:bg-surface-selected-dark'
                  : 'bg-transparent'
              }`}>
              <Ionicons
                name={isFocused ? tab.iconActive : tab.iconOutline}
                size={24}
                color={isFocused ? palette.ink : palette.inkMuted}
              />
            </View>
            <Text
              className={`text-micro ${
                isFocused
                  ? 'text-ink dark:text-ink-dark font-semibold'
                  : 'text-ink-muted dark:text-ink-muted-dark'
              }`}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <DayflowBottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="focus" options={{ title: 'Focus' }} />
      <Tabs.Screen name="wallet" options={{ title: 'Wallet' }} />
    </Tabs>
  );
}
