/** @type {import('tailwindcss').Config} */
const withAlpha = (v) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: withAlpha('--bg'),
          surface: withAlpha('--bg-surface'),
          elev: withAlpha('--bg-elev'),
          border: withAlpha('--bg-border'),
        },
        accent: {
          DEFAULT: withAlpha('--accent'),
          hover: withAlpha('--accent-hover'),
          muted: withAlpha('--accent-muted'),
          2: withAlpha('--accent-2'),
        },
        ok: withAlpha('--ok'),
        warn: withAlpha('--warn'),
        err: withAlpha('--err'),
        text: {
          DEFAULT: withAlpha('--text'),
          muted: withAlpha('--text-muted'),
          subtle: withAlpha('--text-subtle'),
        },
      },
      borderRadius: {
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out both',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
