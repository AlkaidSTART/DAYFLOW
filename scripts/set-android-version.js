#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const buildNumber = Number(process.env.BUILD_NUMBER ?? '');
if (!Number.isInteger(buildNumber) || buildNumber <= 0) {
  console.error('BUILD_NUMBER must be a positive integer');
  process.exit(1);
}

const appJsonPath = path.join(process.cwd(), 'app.json');
const packageJsonPath = path.join(process.cwd(), 'package.json');

const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
appJson.expo.android = appJson.expo.android ?? {};
appJson.expo.android.versionCode = 1000 + buildNumber;

// 若由 v* 标签触发（例如 v1.2.0），自动同步语义化版本号至 app.json 与 package.json
const refType = (process.env.GITHUB_REF_TYPE ?? '').trim();
const refName = (process.env.GITHUB_REF_NAME ?? '').trim();
const pkgJson = fs.existsSync(packageJsonPath)
  ? JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  : {};

if (/^[vV]\d+\.\d+\.\d+/.test(refName)) {
  const cleanVersion = refName.replace(/^[vV]+/, '');
  appJson.expo.version = cleanVersion;

  if (fs.existsSync(packageJsonPath)) {
    pkgJson.version = cleanVersion;
    fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`);
  }
  console.log(`expo.version = ${cleanVersion}`);
} else if (pkgJson.version) {
  appJson.expo.version = pkgJson.version;
}

const baseVersion = appJson.expo.version || '1.0.0';
const releaseTag =
  (refType === 'tag' && refName) || /^[vV]\d+\.\d+\.\d+/.test(refName)
    ? refName
    : `v${baseVersion}-build.${buildNumber}`;

fs.writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);

console.log(`android.versionCode = ${appJson.expo.android.versionCode}`);
console.log(`releaseTag = ${releaseTag}`);

if (process.env.GITHUB_OUTPUT) {
  const apkName = `DAYFLOW-${releaseTag}.apk`;
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `release_tag=${releaseTag}\napk_name=${apkName}\nversion=${baseVersion}\n`
  );
}
