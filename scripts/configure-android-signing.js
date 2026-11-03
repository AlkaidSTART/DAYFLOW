#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const gradlePath = path.join(process.cwd(), 'android', 'app', 'build.gradle');
if (!fs.existsSync(gradlePath)) {
  console.error(`Missing ${gradlePath}; run expo prebuild first.`);
  process.exit(1);
}

let gradle = fs.readFileSync(gradlePath, 'utf8');

if (gradle.includes('signingConfigs.release')) {
  console.log('Release signing is already configured.');
  process.exit(0);
}

const signingConfigsBlock = /signingConfigs\s*\{/;
if (!signingConfigsBlock.test(gradle)) {
  console.error('Could not find signingConfigs block in android/app/build.gradle');
  process.exit(1);
}

const releaseSigningConfig = `
        release {
            // Values are injected from GitHub Actions secrets; never commit real credentials.
            storeFile file(System.getenv("DAYFLOW_KEYSTORE_PATH") ?: "dayflow-release.jks")
            storePassword System.getenv("DAYFLOW_KEYSTORE_PASSWORD")
            keyAlias System.getenv("DAYFLOW_KEY_ALIAS")
            keyPassword System.getenv("DAYFLOW_KEY_PASSWORD")
        }`;

gradle = gradle.replace(signingConfigsBlock, (match) => match + releaseSigningConfig);

const releaseBuildType = /release\s*\{\s*signingConfig signingConfigs\.debug/;
if (!releaseBuildType.test(gradle)) {
  console.error('Could not find the release buildType using the debug signing config');
  process.exit(1);
}

gradle = gradle.replace(releaseBuildType, 'release {\n            signingConfig signingConfigs.release');

fs.writeFileSync(gradlePath, gradle);
console.log('Configured release signing in android/app/build.gradle');
