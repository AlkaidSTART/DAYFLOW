import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticKind = 'start' | 'pause' | 'complete' | 'taskDone' | 'warning';

/**
 * Section 9: 触觉反馈
 * 开始专注 / 暂停继续 / 完成任务 -> Light Impact
 * 完成专注 -> Success Notification
 * 删除 / 超支等确认 -> Warning Notification
 */
export async function triggerHaptic(kind: HapticKind, enabled: boolean): Promise<void> {
  if (!enabled || Platform.OS === 'web') return;
  try {
    if (kind === 'complete') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    if (kind === 'warning') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // 触觉反馈失败不影响业务，不向上抛出
  }
}
