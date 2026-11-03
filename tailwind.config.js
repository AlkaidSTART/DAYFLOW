/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}', './src/app/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: { DEFAULT: '#FAF7F2', dark: '#16130F' },
        surface: { DEFAULT: '#FFFFFF', dark: '#201C17' },
        'surface-muted': { DEFAULT: '#F2ECE4', dark: '#2A251E' },
        'surface-selected': { DEFAULT: '#E8DFD3', dark: '#342D25' },
        line: { DEFAULT: '#E5DCD0', dark: '#3A332A' },
        ink: { DEFAULT: '#1C1917', dark: '#F5F0E8' },
        'ink-muted': { DEFAULT: '#6B6259', dark: '#B3A99C' },
        'ink-subtle': { DEFAULT: '#78706A', dark: '#9A9083' },
        accent: { DEFAULT: '#A8482A', dark: '#E89B7A' },
        'accent-soft': { DEFAULT: '#F6E3D9', dark: '#3A241B' },
        'on-accent': { DEFAULT: '#FFFFFF', dark: '#1C1917' },
        success: { DEFAULT: '#3F7A55', dark: '#7FB894' },
        warning: { DEFAULT: '#8A5A05', dark: '#D9A441' },
        danger: { DEFAULT: '#B3261E', dark: '#F2867D' },
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '20px',
        xl: '28px',
      },
      fontSize: {
        'display-lg': ['64px', { lineHeight: '72px', fontWeight: '600' }],
        display: ['40px', { lineHeight: '48px', fontWeight: '600' }],
        h1: ['28px', { lineHeight: '36px', fontWeight: '600' }],
        h2: ['22px', { lineHeight: '30px', fontWeight: '600' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-strong': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        caption: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        micro: ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
};
