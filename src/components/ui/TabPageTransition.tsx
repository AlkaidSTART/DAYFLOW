import React from 'react';
import { StyleSheet, View } from 'react-native';

export type TabPageTransitionProps = {
  routeKey: string;
  children: React.ReactNode;
};

/**
 * Tab 页面视图容器
 * 页面切换动效统一由 (tabs)/_layout.tsx 的 Tabs 导航层原生硬件加速驱动，
 * 避免组件内部二次 useEffect 延迟置空 opacity 导致布局闪烁与骨架线残影。
 */
export function TabPageTransition({ children }: TabPageTransitionProps) {
  return <View style={styles.flex1}>{children}</View>;
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
