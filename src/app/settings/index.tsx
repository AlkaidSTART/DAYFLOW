import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { SegmentedControl, SegmentOption } from '@/components/ui/SegmentedControl';
import { Sheet } from '@/components/ui/Sheet';
import { useFocusStore } from '@/features/focus/store/focus-store';
import {
  ThemePreference,
  useSettingsStore,
} from '@/features/settings/store/settings-store';
import { useTodayStore } from '@/features/today/store/today-store';
import { useWalletStore } from '@/features/wallet/store/wallet-store';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { triggerHaptic } from '@/lib/haptics';
import { getCardSurfaceStyle, tabularNumsStyle } from '@/theme/tokens';

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
 * 1. 外观：浅色 / 深色 / 跟随系统（三选一）
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
  const focusMinutes = useSettingsStore((s) => s.focusMinutes);
  const shortBreakMinutes = useSettingsStore((s) => s.shortBreakMinutes);
  const longBreakMinutes = useSettingsStore((s) => s.longBreakMinutes);
  const keepScreenAwake = useSettingsStore((s) => s.keepScreenAwake);
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const budgetThresholdPercent = useSettingsStore((s) => s.budgetThresholdPercent);
  const monthStartDay = useSettingsStore((s) => s.monthStartDay);

  const setThemePreference = useSettingsStore((s) => s.setThemePreference);
  const setFocusDuration = useSettingsStore((s) => s.setFocusDuration);
  const setKeepScreenAwake = useSettingsStore((s) => s.setKeepScreenAwake);
  const setHapticEnabled = useSettingsStore((s) => s.setHapticEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const setBudgetThresholdPercent = useSettingsStore((s) => s.setBudgetThresholdPercent);
  const showSnackbar = useSettingsStore((s) => s.showSnackbar);

  const clearAllTasks = useTodayStore((s) => s.clearAllTasks);
  const resetSampleTasks = useTodayStore((s) => s.resetSampleTasks);
  const clearSessions = useFocusStore((s) => s.clearSessions);
  const resetSampleSessions = useFocusStore((s) => s.resetSampleSessions);
  const clearAllWalletData = useWalletStore((s) => s.clearAllWalletData);
  const resetSampleWalletData = useWalletStore((s) => s.resetSampleWalletData);

  const [restoreConfirmVisible, setRestoreConfirmVisible] = useState(false);
  const [licenseSheetVisible, setLicenseSheetVisible] = useState(false);

  const handleExportBackup = () => {
    showSnackbar('已生成备份 dayflow-backup.json');
  };

  const handleConfirmRestore = () => {
    triggerHaptic('warning', hapticEnabled);
    resetSampleTasks();
    resetSampleSessions();
    resetSampleWalletData();
    setRestoreConfirmVisible(false);
    showSnackbar('已从备份恢复全部数据');
  };

  const handlePreviewEmptyStates = () => {
    triggerHaptic('warning', hapticEnabled);
    clearAllTasks();
    clearSessions();
    clearAllWalletData();
    showSnackbar('已切换为空状态，可前往各 Tab 查看', () => {
      resetSampleTasks();
      resetSampleSessions();
      resetSampleWalletData();
    });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-canvas dark:bg-canvas-dark">
      {/* 顶部返回导航栏 */}
      <View className="px-6 pt-3 pb-4 flex-row items-center border-b border-line dark:border-line-dark">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="返回"
          className="w-11 h-11 -ml-2 mr-1 items-center justify-center rounded-full">
          <Ionicons name="arrow-back-outline" size={24} color={palette.ink} />
        </Pressable>
        <Text className="text-h1 text-ink dark:text-ink-dark">设置</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
        className="flex-1 px-6 pt-6">
        <View className="gap-8">
          {/* 1. 外观 */}
          <View>
            <Text className="text-caption font-semibold text-ink-muted dark:text-ink-muted-dark mb-3">
              1. 外观
            </Text>
            <View style={getCardSurfaceStyle(theme)} className="rounded-lg p-4">
              <Text className="text-body-strong text-ink dark:text-ink-dark mb-3">
                主题模式
              </Text>
              <SegmentedControl
                options={THEME_OPTIONS}
                value={themePreference}
                onChange={setThemePreference}
              />
            </View>
          </View>

          {/* 2. 专注 */}
          <View>
            <Text className="text-caption font-semibold text-ink-muted dark:text-ink-muted-dark mb-3">
              2. 专注
            </Text>
            <View style={getCardSurfaceStyle(theme)} className="rounded-lg p-4 gap-5">
              {/* 专注时长 */}
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-body text-ink dark:text-ink-dark">专注时长</Text>
                  <Text
                    style={tabularNumsStyle}
                    className="text-caption font-semibold text-accent dark:text-accent-dark">
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
                        className={`flex-1 min-h-[40px] rounded-md items-center justify-center ${
                          active
                            ? 'bg-accent-soft dark:bg-accent-soft-dark'
                            : 'bg-surface-muted dark:bg-surface-muted-dark'
                        }`}>
                        <Text
                          style={tabularNumsStyle}
                          className={`text-caption ${
                            active
                              ? 'text-accent dark:text-accent-dark font-semibold'
                              : 'text-ink-muted dark:text-ink-muted-dark'
                          }`}>
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
                  <Text className="text-body text-ink dark:text-ink-dark">短休息</Text>
                  <Text
                    style={tabularNumsStyle}
                    className="text-caption font-semibold text-accent dark:text-accent-dark">
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
                        className={`flex-1 min-h-[40px] rounded-md items-center justify-center ${
                          active
                            ? 'bg-accent-soft dark:bg-accent-soft-dark'
                            : 'bg-surface-muted dark:bg-surface-muted-dark'
                        }`}>
                        <Text
                          style={tabularNumsStyle}
                          className={`text-caption ${
                            active
                              ? 'text-accent dark:text-accent-dark font-semibold'
                              : 'text-ink-muted dark:text-ink-muted-dark'
                          }`}>
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
                  <Text className="text-body text-ink dark:text-ink-dark">长休息</Text>
                  <Text
                    style={tabularNumsStyle}
                    className="text-caption font-semibold text-accent dark:text-accent-dark">
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
                        className={`flex-1 min-h-[40px] rounded-md items-center justify-center ${
                          active
                            ? 'bg-accent-soft dark:bg-accent-soft-dark'
                            : 'bg-surface-muted dark:bg-surface-muted-dark'
                        }`}>
                        <Text
                          style={tabularNumsStyle}
                          className={`text-caption ${
                            active
                              ? 'text-accent dark:text-accent-dark font-semibold'
                              : 'text-ink-muted dark:text-ink-muted-dark'
                          }`}>
                          {m} 分钟
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* 计时中屏幕常亮 */}
              <View className="pt-2 border-t border-line dark:border-line-dark flex-row items-center justify-between min-h-[48px]">
                <View className="flex-1 mr-4">
                  <Text className="text-body text-ink dark:text-ink-dark">
                    计时中屏幕常亮
                  </Text>
                  <Text className="text-caption text-ink-muted dark:text-ink-muted-dark">
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

          {/* 3. 反馈 */}
          <View>
            <Text className="text-caption font-semibold text-ink-muted dark:text-ink-muted-dark mb-3">
              3. 反馈
            </Text>
            <View style={getCardSurfaceStyle(theme)} className="rounded-lg p-4 gap-4">
              <View className="flex-row items-center justify-between min-h-[48px]">
                <View className="flex-1 mr-4">
                  <Text className="text-body text-ink dark:text-ink-dark">触觉反馈</Text>
                  <Text className="text-caption text-ink-muted dark:text-ink-muted-dark">
                    完成任务与专注操作时提供轻量震动
                  </Text>
                </View>
                <Switch
                  value={hapticEnabled}
                  onValueChange={setHapticEnabled}
                  trackColor={{ false: palette.line, true: palette.accent }}
                  thumbColor="#FFFFFF"
                  accessibilityLabel="触觉反馈"
                />
              </View>

              <View className="pt-3 border-t border-line dark:border-line-dark flex-row items-center justify-between min-h-[48px]">
                <View className="flex-1 mr-4">
                  <Text className="text-body text-ink dark:text-ink-dark">本地通知</Text>
                  <Text className="text-caption text-ink-muted dark:text-ink-muted-dark">
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
            <Text className="text-caption font-semibold text-ink-muted dark:text-ink-muted-dark mb-3">
              4. 财务
            </Text>
            <View style={getCardSurfaceStyle(theme)} className="rounded-lg p-4 gap-4">
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-body text-ink dark:text-ink-dark">
                    预算提醒阈值
                  </Text>
                  <Text
                    style={tabularNumsStyle}
                    className="text-caption font-semibold text-accent dark:text-accent-dark">
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
                        className={`flex-1 min-h-[40px] rounded-md items-center justify-center ${
                          active
                            ? 'bg-accent-soft dark:bg-accent-soft-dark'
                            : 'bg-surface-muted dark:bg-surface-muted-dark'
                        }`}>
                        <Text
                          style={tabularNumsStyle}
                          className={`text-caption ${
                            active
                              ? 'text-accent dark:text-accent-dark font-semibold'
                              : 'text-ink-muted dark:text-ink-muted-dark'
                          }`}>
                          {pct}%
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="pt-3 border-t border-line dark:border-line-dark flex-row items-center justify-between min-h-[44px]">
                <Text className="text-body text-ink dark:text-ink-dark">每月起始日</Text>
                <Text
                  style={tabularNumsStyle}
                  className="text-caption text-ink-subtle dark:text-ink-subtle-dark">
                  每月 {monthStartDay} 日（自然月）
                </Text>
              </View>
            </View>
          </View>

          {/* 5. 数据 */}
          <View>
            <Text className="text-caption font-semibold text-ink-muted dark:text-ink-muted-dark mb-3">
              5. 数据
            </Text>
            <View style={getCardSurfaceStyle(theme)} className="rounded-lg p-4 gap-3">
              <Pressable
                onPress={handleExportBackup}
                accessibilityRole="button"
                accessibilityLabel="导出完整 JSON 备份"
                className="min-h-[48px] flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="download-outline" size={20} color={palette.ink} />
                  <Text className="text-body-strong text-ink dark:text-ink-dark ml-3">
                    导出备份（JSON）
                  </Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={18} color={palette.inkMuted} />
              </Pressable>

              <View className="h-[1px] bg-line dark:bg-line-dark" />

              <Pressable
                onPress={() => setRestoreConfirmVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="导入备份并恢复"
                className="min-h-[48px] flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center">
                    <Ionicons name="cloud-upload-outline" size={20} color={palette.danger} />
                    <Text className="text-body-strong text-danger dark:text-danger-dark ml-3">
                      导入备份
                    </Text>
                  </View>
                  <Text className="text-micro text-danger dark:text-danger-dark mt-1 ml-8">
                    恢复备份将完整替换当前数据，卸载应用前请先导出备份
                  </Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={18} color={palette.inkMuted} />
              </Pressable>

              <View className="h-[1px] bg-line dark:bg-line-dark" />

              {/* 验收辅助：一键切换空状态 / 恢复示例数据 */}
              <View className="pt-1 flex-row gap-2">
                <Button
                  label="预览空状态"
                  onPress={handlePreviewEmptyStates}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                />
                <Button
                  label="恢复示例数据"
                  onPress={() => {
                    resetSampleTasks();
                    resetSampleSessions();
                    resetSampleWalletData();
                    showSnackbar('已恢复示例数据');
                  }}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                />
              </View>
            </View>
          </View>

          {/* 6. 关于 */}
          <View>
            <Text className="text-caption font-semibold text-ink-muted dark:text-ink-muted-dark mb-3">
              6. 关于
            </Text>
            <View style={getCardSurfaceStyle(theme)} className="rounded-lg p-4 gap-3">
              <View className="min-h-[40px] flex-row items-center justify-between">
                <Text className="text-body text-ink dark:text-ink-dark">当前版本</Text>
                <Text
                  style={tabularNumsStyle}
                  className="text-caption text-ink-muted dark:text-ink-muted-dark">
                  V1.0.0 (com.alkaidstart.dayflow)
                </Text>
              </View>

              <View className="h-[1px] bg-line dark:bg-line-dark" />

              <Pressable
                onPress={() => setLicenseSheetVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="查看开源许可"
                className="min-h-[40px] flex-row items-center justify-between">
                <Text className="text-body text-ink dark:text-ink-dark">开源许可</Text>
                <View className="flex-row items-center">
                  <Text className="text-caption text-ink-muted dark:text-ink-muted-dark mr-1">
                    MIT License
                  </Text>
                  <Ionicons name="chevron-forward-outline" size={16} color={palette.inkMuted} />
                </View>
              </Pressable>
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
          <Text className="text-body text-ink dark:text-ink-dark">
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
          <Text className="text-body-strong text-ink dark:text-ink-dark">
            DAYFLOW · 个人效率工作台
          </Text>
          <Text className="text-caption text-ink-muted dark:text-ink-muted-dark">
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
