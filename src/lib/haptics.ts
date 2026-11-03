import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Platform } from 'react-native';

import { useSettingsStore } from '@/features/settings/store/settings-store';

export type HapticKind =
  | 'start'
  | 'pause'
  | 'complete'
  | 'taskDone'
  | 'warning'
  | 'selection'
  | 'longPress';

const WEB_VIBRATE_PATTERNS: Record<HapticKind, number | number[]> = {
  start: 14,
  pause: 10,
  taskDone: 15,
  selection: 8,
  longPress: 22,
  complete: [18, 45, 28],
  warning: [26, 40, 26],
};

/**
 * Section 9: 触觉反馈
 * - 开始专注 / 暂停继续 / 完成任务 -> Light Impact
 * - 长按进入排序 -> Medium Impact
 * - 完成专注 / 全部重点完成 -> Success Notification
 * - 删除 / 超支等确认 -> Warning Notification
 * - 选择器 / 分段切换 -> Selection
 * - Web 端同步支持 navigator.vibrate
 */
export async function triggerHaptic(kind: HapticKind, enabled?: boolean): Promise<void> {
  const globalEnabled = useSettingsStore.getState().hapticEnabled;
  const isEnabled = enabled !== undefined ? enabled : globalEnabled;
  if (!isEnabled || !globalEnabled) return;

  if (Platform.OS === 'web') {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(WEB_VIBRATE_PATTERNS[kind]);
      }
    } catch {
      // 忽略浏览器权限限制
    }
    return;
  }

  try {
    if (kind === 'complete') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    if (kind === 'warning') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (kind === 'selection') {
      await Haptics.selectionAsync();
      return;
    }
    if (kind === 'longPress') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // 触觉反馈失败不影响业务，不向上抛出
  }
}

export function useHaptic() {
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);

  const haptic = useCallback(
    (kind: HapticKind) => {
      void triggerHaptic(kind, hapticEnabled);
    },
    [hapticEnabled],
  );

  return { haptic, hapticEnabled };
}
