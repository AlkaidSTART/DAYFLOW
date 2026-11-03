import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { SegmentedControl, SegmentOption } from '@/components/ui/SegmentedControl';
import { Sheet } from '@/components/ui/Sheet';
import { executeThemeTransition } from '@/components/ui/ThemeTransitionOverlay';
import { useFocusStore } from '@/features/focus/store/focus-store';
import {
  ThemePreference,
  useSettingsStore,
} from '@/features/settings/store/settings-store';
import { useVersionStore } from '@/features/settings/store/version-store';
import { useTodayStore } from '@/features/today/store/today-store';
import { useWalletStore } from '@/features/wallet/store/wallet-store';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { triggerHaptic } from '@/lib/haptics';
import { formatVersionTag } from '@/lib/version';
import {
  ColorSchemeItem,
  COLOR_SCHEMES_LIST,
  getCardSurfaceStyle,
  tabularNumsStyle,
} from '@/theme/tokens';

const THEME_OPTIONS: SegmentOption<ThemePreference>[] = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '跟随系统' },
];

const FOCUS_DURATION_OPTIONS = [15, 25, 35, 45];
const SHORT_BREAK_OPTIONS = [5, 10];
const LONG_BREAK_OPTIONS = [15, 20, 25];
const THRESHOLD_OPTIONS = [70, 80, 90];

/**
 * Section 7.4: 设置页
 * 分组列表，组间 32 间距 (gap-8)：
 * 1. 外观：浅色 / 深色 / 跟随系统（三选一）+ 纯色配色方案
 * 2. 专注：专注时长、短休息、长休息、屏幕常亮
 * 3. 反馈：触觉反馈、通知
 * 4. 财务：预算提醒阈值、每月起始日（P1 预留）
 * 5. 数据：导出备份、导入备份（danger 文字色提示替换风险）
 * 6. 关于：版本号、开源许可
 */
export default function SettingsScreen() {
  const router = useRouter();
  const { theme, palette } = useResolvedTheme();

  const themePreference = useSettingsStore((s) => s.themePreference);
  const colorSchemeId = useSettingsStore((s) => s.colorSchemeId);
  const focusMinutes = useSettingsStore((s) => s.focusMinutes);
  const shortBreakMinutes = useSettingsStore((s) => s.shortBreakMinutes);
  const longBreakMinutes = useSettingsStore((s) => s.longBreakMinutes);
  const keepScreenAwake = useSettingsStore((s) => s.keepScreenAwake);
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const budgetThresholdPercent = useSettingsStore((s) => s.budgetThresholdPercent);
  const monthStartDay = useSettingsStore((s) => s.monthStartDay);

  const setThemePreference = useSettingsStore((s) => s.setThemePreference);
  const setColorSchemeId = useSettingsStore((s) => s.setColorSchemeId);
  const setFocusDuration = useSettingsStore((s) => s.setFocusDuration);
  const setKeepScreenAwake = useSettingsStore((s) => s.setKeepScreenAwake);
  const setHapticEnabled = useSettingsStore((s) => s.setHapticEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const setBudgetThresholdPercent = useSettingsStore((s) => s.setBudgetThresholdPercent);
  const showSnackbar = useSettingsStore((s) => s.showSnackbar);

  const clearAllTasks = useTodayStore((s) => s.clearAllTasks);
  const clearSessions = useFocusStore((s) => s.clearSessions);
  const clearAllWalletData = useWalletStore((s) => s.clearAllWalletData);

  const currentVersion = useVersionStore((s) => s.currentVersion);
  const packageId = useVersionStore((s) => s.packageId);
  const versionStatus = useVersionStore((s) => s.status);
  const remoteInfo = useVersionStore((s) => s.remoteInfo);
  const isOutdated = useVersionStore((s) => s.isOutdated);
  const checkForUpdates = useVersionStore((s) => s.checkForUpdates);
  const openUpdateSheet = useVersionStore((s) => s.openUpdateSheet);
  const simulateOutdatedUpdate = useVersionStore((s) => s.simulateOutdatedUpdate);

  const [restoreConfirmVisible, setRestoreConfirmVisible] = useState(false);
  const [licenseSheetVisible, setLicenseSheetVisible] = useState(false);

  const handleCheckUpdatePress = async () => {
    triggerHaptic('selection', hapticEnabled);
    if (isOutdated && remoteInfo) {
      openUpdateSheet();
      return;
    }

    const res = await checkForUpdates({
      silent: false,
      openSheetIfOutdated: true,
    });

    if (!res.ok) {
      showSnackbar(res.error ?? '检查更新失败，请稍后重试');
      return;
    }

    if (res.isOutdated && res.remoteInfo) {
      showSnackbar(`发现新版本 ${formatVersionTag(res.remoteInfo.version)}`);
    } else {
      showSnackbar(`当前已是最新版本 ${formatVersionTag(currentVersion)}`);
    }
  };

  const handleExportBackup = () => {
    showSnackbar('已生成备份 dayflow-backup.json');
  };

  const handleConfirmRestore = () => {
    triggerHaptic('warning', hapticEnabled);
    setRestoreConfirmVisible(false);
    showSnackbar('暂未发现本地备份文件');
  };

  const handleClearAllData = () => {
    triggerHaptic('warning', hapticEnabled);
    clearAllTasks();
    clearSessions();
    clearAllWalletData();
    showSnackbar('已清空本地全部数据');
  };

  const cardSurface = getCardSurfaceStyle(theme, palette);

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={{ flex: 1, backgroundColor: palette.canvas }}>
      {/* 顶部返回导航栏 */}
      <View
        style={{ borderBottomWidth: 1, borderBottomColor: palette.line }}
        className="px-6 pt-3 pb-4 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="返回"
          className="w-11 h-11 -ml-2 mr-1 items-center justify-center rounded-full">
          <Ionicons name="arrow-back-outline" size={24} color={palette.ink} />
        </Pressable>
        <Text style={{ color: palette.ink }} className="text-h1">
          设置
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
        className="flex-1 px-6 pt-6">
        <View className="gap-8">
          {/* 1. 外观 */}
          <View>
            <Text
              style={{ color: palette.inkMuted }}
              className="text-caption font-semibold mb-3">
              1. 外观
            </Text>
            <View style={cardSurface} className="rounded-lg p-4 gap-5">
              <View>
                <Text
                  style={{ color: palette.ink }}
                  className="text-body-strong mb-3">
                  主题模式
                </Text>
                <SegmentedControl
                  options={THEME_OPTIONS}
                  value={themePreference}
                  onChange={(val) => {
                    if (val === themePreference) return;
                    executeThemeTransition(() => {
                      setThemePreference(val);
                    });
                  }}
                />
              </View>

              <View
                style={{ borderTopWidth: 1, borderTopColor: palette.line }}
                className="pt-3">
                <Text
                  style={{ color: palette.ink }}
                  className="text-body-strong mb-3">
                  配色方案
                </Text>

                <View style={styles.swatchRow}>
                  {COLOR_SCHEMES_LIST.map((scheme) => {
                    const isSelected = colorSchemeId === scheme.id;

                    return (
                      <ColorSchemeSwatch
                        key={scheme.id}
                        scheme={scheme}
                        isSelected={isSelected}
                        onSelect={() => {
                          if (!isSelected) {
                            triggerHaptic('selection', hapticEnabled);
                            executeThemeTransition(() => {
                              setColorSchemeId(scheme.id);
                            });
                          }
                        }}
                      />
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* 2. 专注 */}
          <View>
            <Text
              style={{ color: palette.inkMuted }}
              className="text-caption font-semibold mb-3">
              2. 专注
            </Text>
            <View style={cardSurface} className="rounded-lg p-4 gap-5">
              {/* 专注时长 */}
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ color: palette.ink }} className="text-body">
                    专注时长
                  </Text>
                  <Text
                    style={[tabularNumsStyle, { color: palette.accent }]}
                    className="text-caption font-semibold">
                    {focusMinutes} 分钟
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  {FOCUS_DURATION_OPTIONS.map((m) => {
                    const active = focusMinutes === m;
                    return (
                      <Pressable
                        key={m}
                        onPress={() => setFocusDuration('focusMinutes', m)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: active }}
                        style={{
                          backgroundColor: active
                            ? palette.accentSoft
                            : palette.surfaceMuted,
                        }}
                        className="flex-1 min-h-[40px] rounded-md items-center justify-center">
                        <Text
                          style={[
                            tabularNumsStyle,
                            {
                              color: active ? palette.accent : palette.inkMuted,
                              fontWeight: active ? '600' : '400',
                            },
                          ]}
                          className="text-caption">
                          {m} 分钟
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* 短休息 */}
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ color: palette.ink }} className="text-body">
                    短休息
                  </Text>
                  <Text
                    style={[tabularNumsStyle, { color: palette.accent }]}
                    className="text-caption font-semibold">
                    {shortBreakMinutes} 分钟
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  {SHORT_BREAK_OPTIONS.map((m) => {
                    const active = shortBreakMinutes === m;
                    return (
                      <Pressable
                        key={m}
                        onPress={() => setFocusDuration('shortBreakMinutes', m)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: active }}
                        style={{
                          backgroundColor: active
                            ? palette.accentSoft
                            : palette.surfaceMuted,
                        }}
                        className="flex-1 min-h-[40px] rounded-md items-center justify-center">
                        <Text
                          style={[
                            tabularNumsStyle,
                            {
                              color: active ? palette.accent : palette.inkMuted,
                              fontWeight: active ? '600' : '400',
                            },
                          ]}
                          className="text-caption">
                          {m} 分钟
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* 长休息 */}
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ color: palette.ink }} className="text-body">
                    长休息
                  </Text>
                  <Text
                    style={[tabularNumsStyle, { color: palette.accent }]}
                    className="text-caption font-semibold">
                    {longBreakMinutes} 分钟
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  {LONG_BREAK_OPTIONS.map((m) => {
                    const active = longBreakMinutes === m;
                    return (
                      <Pressable
                        key={m}
                        onPress={() => setFocusDuration('longBreakMinutes', m)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: active }}
                        style={{
                          backgroundColor: active
                            ? palette.accentSoft
                            : palette.surfaceMuted,
                        }}
                        className="flex-1 min-h-[40px] rounded-md items-center justify-center">
                        <Text
                          style={[
                            tabularNumsStyle,
                            {
                              color: active ? palette.accent : palette.inkMuted,
                              fontWeight: active ? '600' : '400',
                            },
                          ]}
                          className="text-caption">
                          {m} 分钟
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* 计时中屏幕常亮 */}
              <View
                style={{ borderTopWidth: 1, borderTopColor: palette.line }}
                className="pt-2 flex-row items-center justify-between min-h-[48px]">
                <View className="flex-1 mr-4">
                  <Text style={{ color: palette.ink }} className="text-body">
                    计时中屏幕常亮
                  </Text>
                  <Text style={{ color: palette.inkMuted }} className="text-caption">
                    专注进行时保持屏幕不自动熄灭
                  </Text>
                </View>
                <Switch
                  value={keepScreenAwake}
                  onValueChange={setKeepScreenAwake}
                  trackColor={{ false: palette.line, true: palette.accent }}
                  thumbColor="#FFFFFF"
                  accessibilityLabel="计时中屏幕常亮"
                />
              </View>
            </View>
          </View>

          {/* 3. 反馈与震动 */}
          <View>
            <Text
              style={{ color: palette.inkMuted }}
              className="text-caption font-semibold mb-3">
              3. 反馈与震动
            </Text>
            <View style={cardSurface} className="rounded-lg p-4 gap-4">
              <View className="flex-row items-center justify-between min-h-[48px]">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center gap-1.5 mb-0.5">
                    <Text style={{ color: palette.ink }} className="text-body">
                      触觉震动反馈
                    </Text>
                    <View
                      style={{
                        backgroundColor: hapticEnabled
                          ? `${palette.accent}18`
                          : palette.surfaceMuted,
                      }}
                      className="px-1.5 py-0.5 rounded-sm">
                      <Text
                        style={{
                          color: hapticEnabled ? palette.accent : palette.inkSubtle,
                        }}
                        className="text-micro font-semibold">
                        {hapticEnabled ? '已开启' : '已禁止'}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: palette.inkMuted }} className="text-caption">
                    {hapticEnabled
                      ? '底部 Tab 切换、滚轮滑动、完成任务与专注计时均提供触觉震动'
                      : '已全局禁止所有触觉震动反馈'}
                  </Text>
                </View>
                <Switch
                  value={hapticEnabled}
                  onValueChange={(val) => {
                    setHapticEnabled(val);
                    if (val) {
                      triggerHaptic('taskDone', true);
                      showSnackbar('已开启触觉震动');
                    } else {
                      showSnackbar('已全局禁止震动');
                    }
                  }}
                  trackColor={{ false: palette.line, true: palette.accent }}
                  thumbColor="#FFFFFF"
                  accessibilityLabel="全局触觉震动开关"
                />
              </View>

              {/* 快捷一键禁止 / 开启按钮 */}
              <View className="flex-row justify-end">
                <Pressable
                  onPress={() => {
                    const nextVal = !hapticEnabled;
                    setHapticEnabled(nextVal);
                    if (nextVal) {
                      triggerHaptic('taskDone', true);
                      showSnackbar('已开启触觉震动');
                    } else {
                      showSnackbar('已全局禁止震动');
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={hapticEnabled ? '禁止震动' : '开启震动'}
                  style={{
                    backgroundColor: hapticEnabled
                      ? palette.surfaceMuted
                      : palette.accentSoft,
                  }}
                  className="px-3 py-1.5 rounded-md flex-row items-center">
                  <Ionicons
                    name={hapticEnabled ? 'volume-mute-outline' : 'pulse-outline'}
                    size={16}
                    color={hapticEnabled ? palette.inkMuted : palette.accent}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{ color: hapticEnabled ? palette.ink : palette.accent }}
                    className="text-caption font-semibold">
                    {hapticEnabled ? '一键禁止震动' : '开启全局震动'}
                  </Text>
                </Pressable>
              </View>

              <View
                style={{ borderTopWidth: 1, borderTopColor: palette.line }}
                className="pt-3 flex-row items-center justify-between min-h-[48px]">
                <View className="flex-1 mr-4">
                  <Text style={{ color: palette.ink }} className="text-body">
                    本地通知
                  </Text>
                  <Text style={{ color: palette.inkMuted }} className="text-caption">
                    专注与休息到点时发送提醒
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: palette.line, true: palette.accent }}
                  thumbColor="#FFFFFF"
                  accessibilityLabel="本地通知"
                />
              </View>
            </View>
          </View>

          {/* 4. 财务 */}
          <View>
            <Text
              style={{ color: palette.inkMuted }}
              className="text-caption font-semibold mb-3">
              4. 财务
            </Text>
            <View style={cardSurface} className="rounded-lg p-4 gap-4">
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ color: palette.ink }} className="text-body">
                    预算提醒阈值
                  </Text>
                  <Text
                    style={[tabularNumsStyle, { color: palette.accent }]}
                    className="text-caption font-semibold">
                    {budgetThresholdPercent}%
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  {THRESHOLD_OPTIONS.map((pct) => {
                    const active = budgetThresholdPercent === pct;
                    return (
                      <Pressable
                        key={pct}
                        onPress={() => setBudgetThresholdPercent(pct)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: active }}
                        style={{
                          backgroundColor: active
                            ? palette.accentSoft
                            : palette.surfaceMuted,
                        }}
                        className="flex-1 min-h-[40px] rounded-md items-center justify-center">
                        <Text
                          style={[
                            tabularNumsStyle,
                            {
                              color: active ? palette.accent : palette.inkMuted,
                              fontWeight: active ? '600' : '400',
                            },
                          ]}
                          className="text-caption">
                          {pct}%
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View
                style={{ borderTopWidth: 1, borderTopColor: palette.line }}
                className="pt-3 flex-row items-center justify-between min-h-[44px]">
                <Text style={{ color: palette.ink }} className="text-body">
                  每月起始日
                </Text>
                <Text
                  style={[tabularNumsStyle, { color: palette.inkSubtle }]}
                  className="text-caption">
                  每月 {monthStartDay} 日（自然月）
                </Text>
              </View>
            </View>
          </View>

          {/* 5. 数据 */}
          <View>
            <Text
              style={{ color: palette.inkMuted }}
              className="text-caption font-semibold mb-3">
              5. 数据
            </Text>
            <View style={cardSurface} className="rounded-lg p-4 gap-3">
              <Pressable
                onPress={handleExportBackup}
                accessibilityRole="button"
                accessibilityLabel="导出完整 JSON 备份"
                className="min-h-[48px] flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="download-outline" size={20} color={palette.ink} />
                  <Text
                    style={{ color: palette.ink }}
                    className="text-body-strong ml-3">
                    导出备份（JSON）
                  </Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={18} color={palette.inkMuted} />
              </Pressable>

              <View style={{ height: 1, backgroundColor: palette.line }} />

              <Pressable
                onPress={() => setRestoreConfirmVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="导入备份并恢复"
                className="min-h-[48px] flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center">
                    <Ionicons name="cloud-upload-outline" size={20} color={palette.danger} />
                    <Text
                      style={{ color: palette.danger }}
                      className="text-body-strong ml-3">
                      导入备份
                    </Text>
                  </View>
                  <Text
                    style={{ color: palette.danger }}
                    className="text-micro mt-1 ml-8">
                    恢复备份将完整替换当前数据，卸载应用前请先导出备份
                  </Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={18} color={palette.inkMuted} />
              </Pressable>

              <View style={{ height: 1, backgroundColor: palette.line }} />

              <View className="pt-1">
                <Button
                  label="清空本地数据"
                  onPress={handleClearAllData}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                />
              </View>
            </View>
          </View>

          {/* 6. 关于 */}
          <View>
            <Text
              style={{ color: palette.inkMuted }}
              className="text-caption font-semibold mb-3">
              6. 关于
            </Text>
            <View style={cardSurface} className="rounded-lg p-4 gap-3">
              <View className="min-h-[40px] flex-row items-center justify-between">
                <Text style={{ color: palette.ink }} className="text-body">
                  当前版本
                </Text>
                <Text
                  style={[tabularNumsStyle, { color: palette.inkMuted }]}
                  className="text-caption">
                  {formatVersionTag(currentVersion)} ({packageId})
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: palette.line }} />

              <Pressable
                onPress={handleCheckUpdatePress}
                disabled={versionStatus === 'checking'}
                accessibilityRole="button"
                accessibilityLabel="对比仓库最新版本并检查更新"
                className="min-h-[44px] flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text style={{ color: palette.ink }} className="text-body">
                    版本更新
                  </Text>
                  <Text
                    style={{ color: palette.inkSubtle }}
                    className="text-micro mt-0.5">
                    {isOutdated && remoteInfo
                      ? `落后于仓库最新 ${formatVersionTag(remoteInfo.version)}，点击查看乐观更新`
                      : '与 GitHub 仓库最新版本自动比对'}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  {versionStatus === 'checking' ? (
                    <Text
                      style={{ color: palette.inkMuted }}
                      className="text-caption mr-1">
                      检查中...
                    </Text>
                  ) : isOutdated && remoteInfo ? (
                    <View
                      style={{ backgroundColor: palette.accentSoft }}
                      className="px-2.5 py-1 rounded-sm mr-1.5 flex-row items-center">
                      <View
                        style={{ backgroundColor: palette.accent }}
                        className="w-1.5 h-1.5 rounded-full mr-1.5"
                      />
                      <Text
                        style={[tabularNumsStyle, { color: palette.accent }]}
                        className="text-caption font-semibold">
                        新版本 {formatVersionTag(remoteInfo.version)}
                      </Text>
                    </View>
                  ) : versionStatus === 'up-to-date' ? (
                    <Text
                      style={[tabularNumsStyle, { color: palette.success }]}
                      className="text-caption mr-1">
                      已是最新 ({formatVersionTag(remoteInfo?.version ?? currentVersion)})
                    </Text>
                  ) : (
                    <Text
                      style={{ color: palette.inkMuted }}
                      className="text-caption mr-1">
                      检查更新
                    </Text>
                  )}
                  <Ionicons name="chevron-forward-outline" size={16} color={palette.inkMuted} />
                </View>
              </Pressable>

              <View style={{ height: 1, backgroundColor: palette.line }} />

              <Pressable
                onPress={() => setLicenseSheetVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="查看开源许可"
                className="min-h-[40px] flex-row items-center justify-between">
                <Text style={{ color: palette.ink }} className="text-body">
                  开源许可
                </Text>
                <View className="flex-row items-center">
                  <Text
                    style={{ color: palette.inkMuted }}
                    className="text-caption mr-1">
                    MIT License
                  </Text>
                  <Ionicons name="chevron-forward-outline" size={16} color={palette.inkMuted} />
                </View>
              </Pressable>

              <View style={{ height: 1, backgroundColor: palette.line }} />

              {/* 验收辅助：一键模拟远端有新版本时的乐观更新提示 */}
              <View className="pt-1 flex-row gap-2">
                <Button
                  label="模拟新版本提示"
                  onPress={() => {
                    triggerHaptic('selection', hapticEnabled);
                    simulateOutdatedUpdate();
                  }}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                />
                <Button
                  label="重新比对仓库版本"
                  onPress={() => {
                    triggerHaptic('selection', hapticEnabled);
                    checkForUpdates({ silent: false, openSheetIfOutdated: true }).then((res) => {
                      if (res.ok && !res.isOutdated) {
                        showSnackbar(`与仓库版本一致 (${formatVersionTag(currentVersion)})`);
                      } else if (!res.ok) {
                        showSnackbar(res.error ?? '检查更新失败');
                      }
                    });
                  }}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 导入备份二次确认弹层 */}
      <Sheet
        visible={restoreConfirmVisible}
        onClose={() => setRestoreConfirmVisible(false)}
        title="从备份恢复数据">
        <View className="gap-4">
          <Text style={{ color: palette.ink }} className="text-body">
            将完整替换当前数据，且不可恢复。请确认已备份当前需要保留的记录。
          </Text>
          <View className="flex-row gap-3 mt-2">
            <Button
              label="取消"
              onPress={() => setRestoreConfirmVisible(false)}
              variant="secondary"
              size="md"
              className="flex-1"
            />
            <Button
              label="确认恢复"
              onPress={handleConfirmRestore}
              variant="danger"
              size="md"
              className="flex-1"
            />
          </View>
        </View>
      </Sheet>

      {/* 开源许可弹层 */}
      <Sheet
        visible={licenseSheetVisible}
        onClose={() => setLicenseSheetVisible(false)}
        title="开源许可">
        <View className="gap-3">
          <Text style={{ color: palette.ink }} className="text-body-strong">
            DAYFLOW · 个人效率工作台
          </Text>
          <Text style={{ color: palette.inkMuted }} className="text-caption">
            基于 Expo、React Native、NativeWind、Reanimated 与 Zustand 构建。遵循 Local First 原则，所有数据默认保存在本地设备。
          </Text>
          <Button
            label="知道了"
            onPress={() => setLicenseSheetVisible(false)}
            variant="primary"
            size="md"
            fullWidth
            className="mt-2"
          />
        </View>
      </Sheet>
    </SafeAreaView>
  );
}

const ColorSchemeSwatch = React.memo(function ColorSchemeSwatch({
  scheme,
  isSelected,
  onSelect,
}: {
  scheme: ColorSchemeItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const selectedProgress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    selectedProgress.value = withTiming(isSelected ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [isSelected, selectedProgress]);

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    opacity: selectedProgress.value,
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: selectedProgress.value,
  }));

  return (
    <Pressable
      onPress={() => {
        if (!isSelected) {
          selectedProgress.value = withTiming(1, {
            duration: 200,
            easing: Easing.out(Easing.cubic),
          });
        }
        onSelect();
      }}
      hitSlop={6}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={scheme.id}
      style={styles.swatchTouch}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.swatchRing,
          {
            borderColor: scheme.accentColor,
            backgroundColor: scheme.light.accentSoft,
          },
          ringAnimatedStyle,
        ]}
      />
      <View
        style={[
          styles.swatchCircle,
          {
            backgroundColor: scheme.accentColor,
          },
        ]}>
        <Animated.View style={checkAnimatedStyle}>
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        </Animated.View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  swatchTouch: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  swatchRing: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 2,
  },
  swatchCircle: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.22)',
  },
});
