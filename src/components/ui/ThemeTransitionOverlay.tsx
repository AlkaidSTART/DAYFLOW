import { Platform } from 'react-native';

/**
 * 执行平滑主题切换的统一调度器
 * - 在 Web 端：如果支持原生 View Transitions API，触发系统级硬件加速平滑交叉淡出（0 卡顿、0 遮挡）；
 *   若不支持，则动态附加 theme-transitioning 类名，实现 260ms 平滑渐变。
 * - 在 Native 端（iOS / Android）：即时响应更新，无阻塞、无卡顿、无遮挡。
 */
export function executeThemeTransition(updateFn: () => void) {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const doc = document as any;
    if (typeof doc.startViewTransition === 'function') {
      try {
        doc.startViewTransition(() => {
          updateFn();
        });
        return;
      } catch {
        // 遇到异常降级处理
      }
    }

    try {
      const root = document.documentElement;
      root.classList.add('theme-transitioning');
      updateFn();
      setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 320);
      return;
    } catch {
      // 降级处理
    }
  }

  // 原生移动端：同步即时触发，消除任何全屏遮罩造成的卡顿感
  updateFn();
}

/**
 * 全局主题平滑过渡层占位
 * 保证向下兼容，不再使用纯色遮罩覆盖全屏，避免造成白屏/黑屏闪烁与卡顿
 */
export function ThemeTransitionOverlay() {
  return null;
}
