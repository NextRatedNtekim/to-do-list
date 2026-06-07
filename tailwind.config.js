// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
//   darkMode: 'class',
//   theme: {
//     extend: {
//       fontFamily: {
//         display: ['Bricolage Grotesque', 'sans-serif'],
//         body: ['DM Sans', 'sans-serif'],
//         mono: ['JetBrains Mono', 'monospace'],
//       },
//       colors: {
//         brand: {
//           50:  '#f0fdf4',
//           100: '#dcfce7',
//           200: '#bbf7d0',
//           300: '#86efac',
//           400: '#4ade80',
//           500: '#22c55e',
//           600: '#16a34a',
//           700: '#15803d',
//           800: '#166534',
//           900: '#14532d',
//         },
//         surface: {
//           DEFAULT: '#ffffff',
//           secondary: '#f8fafc',
//           tertiary: '#f1f5f9',
//         },
//         dark: {
//           bg:      '#080f09',
//           surface: '#0d1a0f',
//           card:    '#111f13',
//           border:  '#1a2e1d',
//           hover:   '#162019',
//           muted:   '#2a4030',
//         },
//         xp: {
//           gold:   '#f59e0b',
//           silver: '#94a3b8',
//           bronze: '#cd7c2f',
//         },
//       },
//       animation: {
//         'xp-float': 'xp-float 1.2s ease-out forwards',
//         'streak-pulse': 'streak-pulse 2s ease-in-out infinite',
//         'level-up': 'level-up 0.6s cubic-bezier(0.22,1,0.36,1)',
//         'shimmer': 'shimmer 2s ease-in-out infinite',
//       },
//       keyframes: {
//         'xp-float': {
//           '0%':   { opacity: 1, transform: 'translateY(0) scale(1)' },
//           '100%': { opacity: 0, transform: 'translateY(-60px) scale(1.3)' },
//         },
//         'streak-pulse': {
//           '0%, 100%': { filter: 'drop-shadow(0 0 6px rgba(251,146,60,0.4))' },
//           '50%':       { filter: 'drop-shadow(0 0 14px rgba(251,146,60,0.9))' },
//         },
//         'level-up': {
//           '0%':   { transform: 'scale(0.5)', opacity: 0 },
//           '60%':  { transform: 'scale(1.15)' },
//           '100%': { transform: 'scale(1)', opacity: 1 },
//         },
//         'shimmer': {
//           '0%':   { backgroundPosition: '-200% 0' },
//           '100%': { backgroundPosition: '200% 0' },
//         },
//       },
//     },
//   },
//   plugins: [],
// }


// tailwind.config.js — WithTaskr V1
// REPLACE your existing tailwind.config.js with this file entirely.

/** @type {import('tailwindcss').Config} */
export default {
  // IMPORTANT: class-based dark mode so the app can toggle programmatically
  darkMode: 'class',

  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  
  theme: {
    extend: {
      // ─── Brand colors ──────────────────────────────────────────────────────
      colors: {
        brand: {
          DEFAULT: '#16a34a',
          light:   '#22c55e',
          glow:    '#4ade80',
          50:      '#f0fdf4',
          100:     '#dcfce7',
          200:     '#bbf7d0',
          800:     '#166534',
          900:     '#14532d',
          950:     '#052e16',
        },
        partner: {
          DEFAULT: '#3b82f6',
          light:   '#60a5fa',
          bg:      'rgba(59,130,246,0.07)',
          border:  'rgba(59,130,246,0.22)',
        },
        xp: {
          DEFAULT: '#8b5cf6',
          light:   '#a78bfa',
          bg:      'rgba(139,92,246,0.15)',
        },
        alarm: {
          urgent: '#ef4444',
          high:   '#f59e0b',
          medium: '#22c55e',
          low:    '#3b82f6',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          border:  'rgba(255,255,255,0.08)',
          hover:   'rgba(255,255,255,0.08)',
        },
      },

      // ─── Border radius ─────────────────────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ─── Backdrop blur ─────────────────────────────────────────────────────
      backdropBlur: {
        xs: '4px',
        glass: '20px',
      },

      // ─── Box shadows ───────────────────────────────────────────────────────
      boxShadow: {
        'glass':        '0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.08)',
        'glass-light':  '0 8px 32px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9)',
        'brand':        '0 8px 32px rgba(22,163,74,0.4)',
        'brand-sm':     '0 4px 16px rgba(22,163,74,0.3)',
        'partner':      '0 8px 32px rgba(59,130,246,0.3)',
        'xp':           '0 8px 32px rgba(139,92,246,0.4)',
        'nav':          '0 -1px 0 rgba(255,255,255,0.04), 0 16px 48px rgba(0,0,0,0.4)',
      },

      // ─── Animations ────────────────────────────────────────────────────────
      animation: {
        'slide-up':      'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
        'slide-in':      'slideIn 0.28s cubic-bezier(0.4,0,0.2,1)',
        'fade-in':       'fadeIn 0.25s ease',
        'scale-in':      'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        'pulse-green':   'pulseGreen 2s ease infinite',
        'streak-fire':   'firePulse 1.8s ease infinite',
        'xp-float':      'xpFloat 2.2s ease forwards',
        'bar-grow':      'barGrow 1.2s 0.4s cubic-bezier(0.4,0,0.2,1) both',
        'badge-pop':     'badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        'task-done':     'taskDone 0.4s cubic-bezier(0.4,0,0.2,1)',
      },

      keyframes: {
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', scale: '0.97' },
          '100%': { opacity: '1', scale: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.5)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGreen: {
          '0%, 100%': { transform: 'scale(1)',    opacity: '1'   },
          '50%':      { transform: 'scale(1.3)',  opacity: '0.7' },
        },
        firePulse: {
          '0%, 100%': { transform: 'scale(1)'    },
          '50%':      { transform: 'scale(1.12)' },
        },
        xpFloat: {
          '0%':   { opacity: '0', transform: 'translateX(-50%) translateY(20px) scale(0.8)' },
          '15%':  { opacity: '1', transform: 'translateX(-50%) translateY(0) scale(1)'      },
          '80%':  { opacity: '1', transform: 'translateX(-50%) translateY(-8px) scale(1)'   },
          '100%': { opacity: '0', transform: 'translateX(-50%) translateY(-20px) scale(0.9)'},
        },
        barGrow: {
          '0%':   { width: '0%'            },
          '100%': { width: 'var(--target)' },
        },
        badgePop: {
          '0%':   { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        taskDone: {
          '0%':   { transform: 'scale(1)'    },
          '40%':  { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)'    },
        },
      },

      // ─── Font family ───────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },

  plugins: [],
};