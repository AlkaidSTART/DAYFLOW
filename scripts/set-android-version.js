#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(process.cwd(), 'app.json');
const packageJsonPath = path.join(process.cwd(), 'package.json');
const buildGradlePath = path.join(process.cwd(), 'android', 'app', 'build.gradle');

const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const pkgJson = fs.existsSync(packageJsonPath)
  ? JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  : {};

// 1. 获取或计算自增的 buildNumber
let buildNumber = Number(process.env.BUILD_NUMBER ?? '');
if (!Number.isInteger(buildNumber) || buildNumber <= 0) {
  // 未显式提供 BUILD_NUMBER 时（如本地打包），根据现有 versionCode 自动递增
  const currentCode = Number(appJson.expo?.android?.versionCode ?? 1000);
  buildNumber = currentCode >= 1000 ? currentCode - 1000 + 1 : currentCode + 1;
}

// 2. 计算 Android 专用的递增 versionCode（>= 1000，确保安装器与系统允许平滑覆盖升级）
const versionCode = 1000 + buildNumber;
appJson.expo.android = appJson.expo.android ?? {};
appJson.expo.android.versionCode = versionCode;

// 3. 计算语义化版本号 versionName 与 Release 标签
const refType = (process.env.GITHUB_REF_TYPE ?? '').trim();
const refName = (process.env.GITHUB_REF_NAME ?? '').trim();

// 提取基础语义化版本（如 1.0.0，自动剥离现有的 -build.* 后缀）
const rawBase = (pkgJson.version || appJson.expo?.version || '1.0.0')
  .trim()
  .replace(/^[vV]+/, '');
const baseVersion = rawBase.replace(/-build\.\d+.*$/i, '') || '1.0.0';

let finalVersion = '';
let releaseTag = '';

if (/^[vV]\d+\.\d+\.\d+/.test(refName)) {
  // 显式由 v* 标签触发发布（例如 v1.1.0）
  finalVersion = refName.replace(/^[vV]+/, '');
  releaseTag = `v${finalVersion}`;
} else {
  // 分支构建（例如 push to main / CI 定时打包 / 本地打包），每次打包版本号均递增
  finalVersion = `${baseVersion}-build.${buildNumber}`;
  releaseTag = `v${finalVersion}`;
}

// 4. 同步写入 app.json（Expo prebuild 与应用内读取版本号的唯一源头）
appJson.expo.version = finalVersion;
fs.writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);

// 5. 同步写入 package.json
if (fs.existsSync(packageJsonPath)) {
  pkgJson.version = finalVersion;
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`);
}

// 6. 若本地已存在 android/app/build.gradle，同步更新 versionCode 与 versionName
if (fs.existsSync(buildGradlePath)) {
  let gradle = fs.readFileSync(buildGradlePath, 'utf8');
  gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  gradle = gradle.replace(/versionName\s+["'].*?["']/, `versionName "${finalVersion}"`);
  fs.writeFileSync(buildGradlePath, gradle);
}

console.log(`expo.version = ${finalVersion}`);
console.log(`android.versionCode = ${versionCode}`);
console.log(`releaseTag = ${releaseTag}`);

if (process.env.GITHUB_OUTPUT) {
  const apkName = `DAYFLOW-${releaseTag}.apk`;
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `release_tag=${releaseTag}\napk_name=${apkName}\nversion=${finalVersion}\nversion_code=${versionCode}\n`
  );
}
