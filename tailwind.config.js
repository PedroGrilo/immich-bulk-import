/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0b0d12',
          surface: '#11141b',
          elev: '#171b24',
          border: '#232836',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#7c7fff',
          muted: '#3a3f7a',
        },
        ok: '#10b981',
        warn: '#f59e0b',
        err: '#ef4444',
        text: {
          DEFAULT: '#e5e7eb',
          muted: '#9ca3af',
          subtle: '#6b7280',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99,102,241,0.4), 0 4px 20px rgba(99,102,241,0.15)',
        card: '0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
