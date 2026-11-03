/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}', './src/app/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // 颜色变量由主题系统同步驱动，兼顾浅色/深色模式与多套配色方案单帧瞬时切换
      colors: {
        canvas: { DEFAULT: 'var(--color-canvas)', dark: 'var(--color-canvas)' },
        surface: { DEFAULT: 'var(--color-surface)', dark: 'var(--color-surface)' },
        'surface-muted': {
          DEFAULT: 'var(--color-surface-muted)',
          dark: 'var(--color-surface-muted)',
        },
        'surface-selected': {
          DEFAULT: 'var(--color-surface-selected)',
          dark: 'var(--color-surface-selected)',
        },
        line: { DEFAULT: 'var(--color-line)', dark: 'var(--color-line)' },
        ink: { DEFAULT: 'var(--color-ink)', dark: 'var(--color-ink)' },
        'ink-muted': {
          DEFAULT: 'var(--color-ink-muted)',
          dark: 'var(--color-ink-muted)',
        },
        'ink-subtle': {
          DEFAULT: 'var(--color-ink-subtle)',
          dark: 'var(--color-ink-subtle)',
        },
        accent: { DEFAULT: 'var(--color-accent)', dark: 'var(--color-accent)' },
        'accent-soft': {
          DEFAULT: 'var(--color-accent-soft)',
          dark: 'var(--color-accent-soft)',
        },
        'on-accent': {
          DEFAULT: 'var(--color-on-accent)',
          dark: 'var(--color-on-accent)',
        },
        success: { DEFAULT: 'var(--color-success)', dark: 'var(--color-success)' },
        warning: { DEFAULT: 'var(--color-warning)', dark: 'var(--color-warning)' },
        danger: { DEFAULT: 'var(--color-danger)', dark: 'var(--color-danger)' },
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
