/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
        },
        dark: {
          bg:      '#080f09',
          surface: '#0d1a0f',
          card:    '#111f13',
          border:  '#1a2e1d',
          hover:   '#162019',
          muted:   '#2a4030',
        },
        xp: {
          gold:   '#f59e0b',
          silver: '#94a3b8',
          bronze: '#cd7c2f',
        },
      },
      animation: {
        'xp-float': 'xp-float 1.2s ease-out forwards',
        'streak-pulse': 'streak-pulse 2s ease-in-out infinite',
        'level-up': 'level-up 0.6s cubic-bezier(0.22,1,0.36,1)',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        'xp-float': {
          '0%':   { opacity: 1, transform: 'translateY(0) scale(1)' },
          '100%': { opacity: 0, transform: 'translateY(-60px) scale(1.3)' },
        },
        'streak-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 6px rgba(251,146,60,0.4))' },
          '50%':       { filter: 'drop-shadow(0 0 14px rgba(251,146,60,0.9))' },
        },
        'level-up': {
          '0%':   { transform: 'scale(0.5)', opacity: 0 },
          '60%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
