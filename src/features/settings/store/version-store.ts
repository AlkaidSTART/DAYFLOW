import { create } from 'zustand';

import {
  APP_VERSION_CONFIG,
  fetchLatestRepoVersion,
  formatVersionTag,
  isVersionOutdated,
  parseSemver,
  RemoteVersionInfo,
} from '@/lib/version';

export type VersionCheckStatus =
  | 'idle'
  | 'checking'
  | 'up-to-date'
  | 'outdated'
  | 'error';

export type CheckForUpdatesOptions = {
  /** 静默检查（启动时后台检查，失败不报错，发现更新仅温和提示） */
  silent?: boolean;
  /** 若检测到落后于仓库最新版本，是否自动展开更新详情弹层 */
  openSheetIfOutdated?: boolean;
};

export type CheckForUpdatesResult = {
  ok: boolean;
  isOutdated: boolean;
  remoteInfo: RemoteVersionInfo | null;
  error?: string;
};

export type VersionState = {
  currentVersion: string;
  versionCode: number;
  packageId: string;
  status: VersionCheckStatus;
  remoteInfo: RemoteVersionInfo | null;
  isOutdated: boolean;
  /** 用户已手动关闭/暂不提醒的远端版本号（乐观更新：不强行阻断或反复打扰） */
  dismissedVersion: string | null;
  updateSheetVisible: boolean;
  lastCheckedAt: string | null;
  errorMessage: string | null;

  checkForUpdates: (options?: CheckForUpdatesOptions) => Promise<CheckForUpdatesResult>;
  dismissUpdateBanner: (version?: string) => void;
  openUpdateSheet: () => void;
  closeUpdateSheet: () => void;
  simulateOutdatedUpdate: () => void;
};

export const useVersionStore = create<VersionState>((set, get) => ({
  currentVersion: APP_VERSION_CONFIG.currentVersion,
  versionCode: APP_VERSION_CONFIG.versionCode,
  packageId: APP_VERSION_CONFIG.packageId,
  status: 'idle',
  remoteInfo: null,
  isOutdated: false,
  dismissedVersion: null,
  updateSheetVisible: false,
  lastCheckedAt: null,
  errorMessage: null,

  checkForUpdates: async (options = {}) => {
    const { silent = true, openSheetIfOutdated = false } = options;

    if (get().status === 'checking') {
      return {
        ok: false,
        isOutdated: get().isOutdated,
        remoteInfo: get().remoteInfo,
      };
    }

    set({
      status: 'checking',
      errorMessage: null,
    });

    try {
      const remoteInfo = await fetchLatestRepoVersion();
      const currentVersion = get().currentVersion;
      const outdated = isVersionOutdated(currentVersion, remoteInfo.version);

      set({
        remoteInfo,
        isOutdated: outdated,
        status: outdated ? 'outdated' : 'up-to-date',
        lastCheckedAt: new Date().toISOString(),
        errorMessage: null,
        updateSheetVisible: outdated && openSheetIfOutdated ? true : get().updateSheetVisible,
      });

      return {
        ok: true,
        isOutdated: outdated,
        remoteInfo,
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '检查更新失败，请检查网络连接';

      // 乐观更新策略：静默检查失败时保持静默，不打扰用户正常使用
      set({
        status: silent ? 'idle' : 'error',
        errorMessage: silent ? null : message,
      });

      return {
        ok: false,
        isOutdated: get().isOutdated,
        remoteInfo: get().remoteInfo,
        error: message,
      };
    }
  },

  dismissUpdateBanner: (version) => {
    const targetVersion = version ?? get().remoteInfo?.version ?? null;
    set({
      dismissedVersion: targetVersion,
      updateSheetVisible: false,
    });
  },

  openUpdateSheet: () => set({ updateSheetVisible: true }),

  closeUpdateSheet: () => set({ updateSheetVisible: false }),

  simulateOutdatedUpdate: () => {
    const current = get().currentVersion;
    const parsed = parseSemver(current);
    const nextVersion = `${parsed.major}.${parsed.minor + 1}.0`;
    const tag = formatVersionTag(nextVersion);

    const mockRemote: RemoteVersionInfo = {
      version: nextVersion,
      tagName: tag,
      title: `DAYFLOW ${tag}`,
      notes:
        '1. 新增版本记录与仓库远端版本自动比对机制\n2. 优化 Today 工作台与专注计时器交互体验\n3. 修复已知问题并提升整体稳定性',
      publishedAt: new Date().toISOString(),
      releaseUrl: APP_VERSION_CONFIG.releasesUrl,
      apkDownloadUrl: `${APP_VERSION_CONFIG.releasesUrl}/latest/download/app-release.apk`,
      source: 'mock',
    };

    set({
      remoteInfo: mockRemote,
      isOutdated: true,
      status: 'outdated',
      dismissedVersion: null,
      lastCheckedAt: new Date().toISOString(),
      errorMessage: null,
      updateSheetVisible: true,
    });
  },
}));
