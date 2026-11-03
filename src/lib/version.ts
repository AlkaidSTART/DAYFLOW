import Constants from 'expo-constants';

import appJson from '../../app.json';

export type VersionSource = 'github-release' | 'github-tag' | 'github-raw' | 'mock';

export type RemoteVersionInfo = {
  /** 归一化后的语义化版本号，例如 "1.1.0" */
  version: string;
  /** 原始标签名，例如 "v1.1.0" */
  tagName: string;
  /** 发布标题 */
  title: string;
  /** 更新日志 / 说明 */
  notes: string;
  /** 发布时间 ISO 字符串 */
  publishedAt: string | null;
  /** GitHub Release 页面链接 */
  releaseUrl: string;
  /** APK 直接下载链接（若存在 Release Asset） */
  apkDownloadUrl: string | null;
  /** 数据来源 */
  source: VersionSource;
};

/**
 * 当前应用版本与仓库配置中心
 * 统一从 app.json 与 Expo Constants 读取，作为全局唯一版本数据源
 */
export const APP_VERSION_CONFIG = {
  currentVersion: normalizeVersion(
    Constants.expoConfig?.version ?? appJson.expo.version ?? '1.0.0',
  ),
  versionCode:
    Constants.expoConfig?.android?.versionCode ??
    appJson.expo.android?.versionCode ??
    1,
  packageId:
    Constants.expoConfig?.android?.package ??
    appJson.expo.android?.package ??
    'com.alkaidstart.dayflow',
  repoOwner: 'AlkaidSTART',
  repoName: 'DAYFLOW',
  repoBranch: 'main',
  repoUrl: 'https://github.com/AlkaidSTART/DAYFLOW',
  releasesUrl: 'https://github.com/AlkaidSTART/DAYFLOW/releases',
} as const;

/**
 * 去除版本号前缀 v/V 及空白字符
 */
export function normalizeVersion(raw: string): string {
  return raw.trim().replace(/^[vV]+/, '');
}

/**
 * 格式化为带 v 前缀的版本标签（例如 v1.0.0）
 */
export function formatVersionTag(raw: string): string {
  const clean = normalizeVersion(raw);
  return clean ? `v${clean}` : 'v0.0.0';
}

type ParsedSemver = {
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
  buildNum: number | null;
};

/**
 * 解析语义化版本号（支持 x.y.z 及预发布后缀如 1.2.0-beta.1、1.0.0-build.5）
 */
export function parseSemver(version: string): ParsedSemver {
  const clean = normalizeVersion(version);
  const [corePart, prereleasePart] = clean.split('-', 2);
  const segments = (corePart ?? '').split('.').map((s) => {
    const n = Number.parseInt(s, 10);
    return Number.isFinite(n) ? n : 0;
  });

  let buildNum: number | null = null;
  if (prereleasePart) {
    const match = prereleasePart.match(/^build\.?(\d+)$/i);
    if (match) {
      buildNum = Number.parseInt(match[1], 10);
    }
  }

  return {
    major: segments[0] ?? 0,
    minor: segments[1] ?? 0,
    patch: segments[2] ?? 0,
    prerelease: prereleasePart ?? null,
    buildNum,
  };
}

/**
 * 比较两个版本号：
 * - 返回 -1 表示 current < target（当前版本落后）
 * - 返回  0 表示版本一致
 * - 返回  1 表示 current > target（当前版本领先）
 */
export function compareVersions(current: string, target: string): -1 | 0 | 1 {
  const a = parseSemver(current);
  const b = parseSemver(target);

  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;

  // 若两者核心语义版本相同，且包含 CI 打包编号（build.X）：
  // 无 build 后缀的基础版视作 build 0（即未经打包递增的基础代码）
  if (a.buildNum !== null || b.buildNum !== null) {
    const aNum = a.buildNum ?? 0;
    const bNum = b.buildNum ?? 0;
    if (aNum !== bNum) return aNum < bNum ? -1 : 1;
    return 0;
  }

  // 常规语义化预发布标签（例如 1.0.0 正式版高于 1.0.0-beta.1）
  if (a.prerelease === null && b.prerelease !== null) return 1;
  if (a.prerelease !== null && b.prerelease === null) return -1;
  if (a.prerelease !== null && b.prerelease !== null) {
    if (a.prerelease === b.prerelease) return 0;
    return a.prerelease.localeCompare(b.prerelease, undefined, { numeric: true }) < 0
      ? -1
      : 1;
  }

  return 0;
}

/**
 * 判断当前版本是否落后于远端仓库版本
 */
export function isVersionOutdated(currentVersion: string, remoteVersion: string): boolean {
  return compareVersions(currentVersion, remoteVersion) < 0;
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

type GitHubReleaseResponse = {
  tag_name?: string;
  name?: string;
  body?: string;
  published_at?: string;
  html_url?: string;
  assets?: {
    name?: string;
    browser_download_url?: string;
  }[];
};

type GitHubTagItem = {
  name?: string;
};

type RawAppJsonResponse = {
  version?: string;
  expo?: {
    version?: string;
  };
};

/**
 * 从 GitHub 仓库获取最新版本信息
 * 优先级：
 * 1. GitHub Releases Latest（含 APK 下载链接与 Release Notes）
 * 2. GitHub Tags 列表（取最高语义化版本 Tag）
 * 3. 仓库默认分支 app.json（兜底对比仓库源码中的版本号）
 */
export async function fetchLatestRepoVersion(): Promise<RemoteVersionInfo> {
  const { repoOwner, repoName, repoBranch, releasesUrl, repoUrl } = APP_VERSION_CONFIG;
  const candidates: RemoteVersionInfo[] = [];

  // 1. 尝试读取 GitHub Latest Release
  try {
    const release = await fetchJsonWithTimeout<GitHubReleaseResponse>(
      `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`,
    );

    if (release?.tag_name) {
      const version = normalizeVersion(release.tag_name);
      const apkAsset = release.assets?.find(
        (asset) =>
          typeof asset.name === 'string' &&
          asset.name.toLowerCase().endsWith('.apk') &&
          typeof asset.browser_download_url === 'string',
      );

      candidates.push({
        version,
        tagName: formatVersionTag(version),
        title: release.name?.trim() || `DAYFLOW ${formatVersionTag(version)}`,
        notes:
          release.body?.trim() ||
          '包含体验优化与问题修复，建议更新至最新版本。',
        publishedAt: release.published_at ?? null,
        releaseUrl: release.html_url || `${releasesUrl}/tag/${release.tag_name}`,
        apkDownloadUrl: apkAsset?.browser_download_url ?? null,
        source: 'github-release',
      });
    }
  } catch {
    // 忽略并继续尝试 Tags 与源码 app.json
  }

  // 2. 尝试读取 GitHub Tags（处理仅有 tag 但尚未创建正式 Release 或最新 tag 更新的场景）
  try {
    const tags = await fetchJsonWithTimeout<GitHubTagItem[]>(
      `https://api.github.com/repos/${repoOwner}/${repoName}/tags?per_page=10`,
    );

    if (Array.isArray(tags) && tags.length > 0) {
      const validTags = tags
        .map((t) => t.name?.trim() ?? '')
        .filter((name) => /^[vV]?\d+\.\d+\.\d+/.test(name));

      if (validTags.length > 0) {
        validTags.sort((a, b) => compareVersions(b, a));
        const highestTag = validTags[0];
        const version = normalizeVersion(highestTag);

        candidates.push({
          version,
          tagName: formatVersionTag(version),
          title: `DAYFLOW ${formatVersionTag(version)}`,
          notes: '仓库已发布新版本标签，可前往 GitHub Releases 查看并下载最新安装包。',
          publishedAt: null,
          releaseUrl: `${releasesUrl}/tag/${highestTag}`,
          apkDownloadUrl: null,
          source: 'github-tag',
        });
      }
    }
  } catch {
    // 忽略并继续尝试 Raw app.json
  }

  // 3. 尝试读取仓库默认分支的 app.json（当仓库直接提交提升了版本号时也能检测到）
  try {
    const rawAppJson = await fetchJsonWithTimeout<RawAppJsonResponse>(
      `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${repoBranch}/app.json`,
    );
    const rawVersion = rawAppJson?.expo?.version ?? rawAppJson?.version;
    if (rawVersion) {
      const version = normalizeVersion(rawVersion);
      candidates.push({
        version,
        tagName: formatVersionTag(version),
        title: `DAYFLOW ${formatVersionTag(version)}`,
        notes: '仓库主分支已更新至新版本，可前往仓库查看最新构建或发布。',
        publishedAt: null,
        releaseUrl: releasesUrl || repoUrl,
        apkDownloadUrl: null,
        source: 'github-raw',
      });
    }
  } catch {
    // 忽略
  }

  if (candidates.length === 0) {
    throw new Error('无法连接至 GitHub 仓库获取版本信息，请稍后重试');
  }

  // 取所有成功返回来源中版本号最高的一项（若版本号相同则优先保留包含 APK 下载链接的项）
  candidates.sort((a, b) => {
    const cmp = compareVersions(b.version, a.version);
    if (cmp !== 0) return cmp;
    if (b.apkDownloadUrl && !a.apkDownloadUrl) return 1;
    if (!b.apkDownloadUrl && a.apkDownloadUrl) return -1;
    return 0;
  });
  return candidates[0];
}
