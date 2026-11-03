import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { useSettingsStore } from '@/features/settings/store/settings-store';
import { useVersionStore } from '@/features/settings/store/version-store';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { triggerHaptic } from '@/lib/haptics';
import { APP_VERSION_CONFIG, formatVersionTag } from '@/lib/version';
import { tabularNumsStyle } from '@/theme/tokens';

/**
 * 乐观更新提示底部弹层（非强制阻断，用户可随时选择前往更新或暂不提醒）
 */
export function UpdatePromptSheet() {
  const { palette } = useResolvedTheme();

  const currentVersion = useVersionStore((s) => s.currentVersion);
  const remoteInfo = useVersionStore((s) => s.remoteInfo);
  const visible = useVersionStore((s) => s.updateSheetVisible);
  const closeUpdateSheet = useVersionStore((s) => s.closeUpdateSheet);
  const dismissUpdateBanner = useVersionStore((s) => s.dismissUpdateBanner);

  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const showSnackbar = useSettingsStore((s) => s.showSnackbar);

  if (!remoteInfo) return null;

  const targetUrl =
    remoteInfo.apkDownloadUrl || remoteInfo.releaseUrl || APP_VERSION_CONFIG.releasesUrl;

  const handleConfirmUpdate = async () => {
    triggerHaptic('selection', hapticEnabled);
    closeUpdateSheet();
    showSnackbar(`正在前往下载 ${formatVersionTag(remoteInfo.version)} 更新包`);
    try {
      await Linking.openURL(targetUrl);
    } catch {
      showSnackbar('无法打开外部链接，请前往 GitHub Releases 下载');
    }
  };

  const handleOpenReleasePage = async () => {
    const url = remoteInfo.releaseUrl || APP_VERSION_CONFIG.releasesUrl;
    closeUpdateSheet();
    try {
      await Linking.openURL(url);
    } catch {
      showSnackbar('无法打开仓库页面');
    }
  };

  const handleDismissCurrentVersion = () => {
    dismissUpdateBanner(remoteInfo.version);
    showSnackbar(`已忽略 ${formatVersionTag(remoteInfo.version)} 横幅提醒，可在设置中随时查看`);
  };

  return (
    <Sheet visible={visible} onClose={closeUpdateSheet} title="发现新版本">
      <View className="gap-4">
        {/* 版本对比胶囊卡 */}
        <View className="rounded-lg p-4 bg-surface-muted dark:bg-surface-muted-dark flex-row items-center justify-between">
          <View>
            <Text className="text-micro text-ink-muted dark:text-ink-muted-dark mb-1">
              当前版本
            </Text>
            <Text
              style={tabularNumsStyle}
              className="text-body-strong text-ink dark:text-ink-dark">
              {formatVersionTag(currentVersion)}
            </Text>
          </View>

          <View className="px-3 items-center">
            <Ionicons name="arrow-forward-outline" size={20} color={palette.accent} />
          </View>

          <View className="items-end">
            <Text className="text-micro text-accent dark:text-accent-dark mb-1">
              仓库最新版本
            </Text>
            <View className="px-2.5 py-0.5 rounded-sm bg-accent-soft dark:bg-accent-soft-dark">
              <Text
                style={tabularNumsStyle}
                className="text-body-strong text-accent dark:text-accent-dark">
                {formatVersionTag(remoteInfo.version)}
              </Text>
            </View>
          </View>
        </View>

        {/* 更新内容说明 */}
        <View className="rounded-lg p-4 border border-line dark:border-line-dark">
          <Text className="text-caption font-semibold text-ink dark:text-ink-dark mb-2">
            {remoteInfo.title || `版本说明 (${formatVersionTag(remoteInfo.version)})`}
          </Text>
          <Text className="text-caption text-ink-muted dark:text-ink-muted-dark leading-5">
            {remoteInfo.notes}
          </Text>

          {remoteInfo.apkDownloadUrl ? (
            <Pressable
              onPress={handleOpenReleasePage}
              hitSlop={8}
              accessibilityRole="link"
              accessibilityLabel="在 GitHub 查看完整 Release 说明"
              className="mt-3 pt-2 border-t border-line dark:border-line-dark flex-row items-center">
              <Ionicons name="logo-github" size={14} color={palette.inkMuted} />
              <Text className="text-micro text-ink-muted dark:text-ink-muted-dark ml-1.5">
                查看 GitHub Release 详情
              </Text>
              <Ionicons
                name="open-outline"
                size={13}
                color={palette.inkMuted}
                style={{ marginLeft: 4 }}
              />
            </Pressable>
          ) : null}
        </View>

        {/* 乐观更新说明（不强制阻断当前操作） */}
        <Text className="text-micro text-ink-subtle dark:text-ink-subtle-dark">
          更新采用非阻断方式，你可以随时继续记录任务或专注；覆盖安装新版本前建议在「设置 - 数据」中导出备份。
        </Text>

        {/* 操作按钮区 */}
        <View className="flex-row gap-3 mt-1">
          <Button
            label="暂不更新"
            onPress={handleDismissCurrentVersion}
            variant="secondary"
            size="md"
            className="flex-1"
          />
          <Button
            label={remoteInfo.apkDownloadUrl ? '下载更新 APK' : '前往仓库更新'}
            onPress={handleConfirmUpdate}
            variant="primary"
            size="md"
            className="flex-1"
          />
        </View>
      </View>
    </Sheet>
  );
}
