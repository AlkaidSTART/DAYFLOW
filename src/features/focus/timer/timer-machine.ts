/**
 * Section 5.1 (tech-stack): 计时引擎（纯函数）
 * 显示靠刷新，时间靠时间戳。
 */

export function formatTimerMMSS(totalSeconds: number): string {
  const safe = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function computeRemainingSeconds(targetEndAt: number, now: number): number {
  const diffMs = Math.max(0, targetEndAt - now);
  return Math.ceil(diffMs / 1000);
}

export function computeProgressRatio(
  plannedSeconds: number,
  remainingSeconds: number,
): number {
  if (plannedSeconds <= 0) return 0;
  const elapsed = Math.max(0, plannedSeconds - remainingSeconds);
  return Math.max(0, Math.min(1, elapsed / plannedSeconds));
}
