const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// pnpm links packages into node_modules/.pnpm, so the hierarchical lookup must stay enabled:
// disabling it makes transitive deps such as @expo/metro-runtime unresolvable.
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

module.exports = withNativeWind(config, { input: './src/global.css' });
