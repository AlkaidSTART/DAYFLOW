#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const gradlePath = path.join(process.cwd(), 'android', 'app', 'build.gradle');
if (!fs.existsSync(gradlePath)) {
  console.error(`Missing ${gradlePath}; run expo prebuild first.`);
  process.exit(1);
}

let gradle = fs.readFileSync(gradlePath, 'utf8');

if (gradle.includes('signingConfig signingConfigs.release')) {
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

const buildTypesIndex = gradle.indexOf('buildTypes {');
const releaseIndex = buildTypesIndex === -1 ? -1 : gradle.indexOf('release {', buildTypesIndex);
const debugSigning = 'signingConfig signingConfigs.debug';
const debugSigningIndex = releaseIndex === -1 ? -1 : gradle.indexOf(debugSigning, releaseIndex);

if (buildTypesIndex === -1 || releaseIndex === -1 || debugSigningIndex === -1) {
  console.error('Could not find the release buildType using the debug signing config');
  process.exit(1);
}

gradle =
  gradle.slice(0, debugSigningIndex) +
  'signingConfig signingConfigs.release' +
  gradle.slice(debugSigningIndex + debugSigning.length);

fs.writeFileSync(gradlePath, gradle);
console.log('Configured release signing in android/app/build.gradle');
