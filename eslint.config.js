// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // Reanimated shared values are mutated via `.value` by design; React Compiler flags it anyway.
      'react-hooks/immutability': 'off',
      // Forms prefill local state from props when a sheet becomes visible.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);
