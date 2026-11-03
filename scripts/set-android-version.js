#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const buildNumber = Number(process.env.BUILD_NUMBER ?? '');
if (!Number.isInteger(buildNumber) || buildNumber <= 0) {
  console.error('BUILD_NUMBER must be a positive integer');
  process.exit(1);
}

const appJsonPath = path.join(process.cwd(), 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
appJson.expo.android = appJson.expo.android ?? {};
appJson.expo.android.versionCode = 1000 + buildNumber;
fs.writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);

console.log(`android.versionCode = ${appJson.expo.android.versionCode}`);
