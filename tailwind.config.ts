import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep luxury surfaces
        background: '#0C0C0C',
        surface: '#121212',
        'surface-elevated': '#181818',
        'surface-hover': '#1E1E1E',

        // Hairline borders
        border: {
          DEFAULT: '#242424',
          subtle: '#1C1C1C',
          strong: '#2E2E2E',
        },

        // Brass/gold accent — refined, not garish
        gold: {
          DEFAULT: '#C6973F',
          light: '#DEB96A',
          muted: '#8A6B2C',
          glow: 'rgba(198,151,63,0.15)',
        },

        // Typography scale
        ink: {
          DEFAULT: '#EDE8E0',   // off-white/cream primary text
          secondary: '#8A8278', // warm muted secondary
          muted: '#524D47',     // very muted
          inverse: '#0C0C0C',
        },

        // Status colours — subdued
        live: {
          DEFAULT: '#C04040',
          bg: 'rgba(192,64,64,0.12)',
        },
        final: {
          DEFAULT: '#4A4A4A',
          bg: 'rgba(74,74,74,0.15)',
        },
        edge: {
          high: '#4A9B6F',
          low: '#C6973F',
        },
      },

      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'ui-serif', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
        xs:   ['0.75rem',  { lineHeight: '1.125rem', letterSpacing: '0.04em' }],
        sm:   ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0.01em' }],
        base: ['1rem',     { lineHeight: '1.625rem', letterSpacing: '0' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem',  letterSpacing: '-0.01em' }],
        xl:   ['1.25rem',  { lineHeight: '1.875rem', letterSpacing: '-0.02em' }],
        '2xl':['1.5rem',   { lineHeight: '2rem',     letterSpacing: '-0.025em' }],
        '3xl':['1.875rem', { lineHeight: '2.25rem',  letterSpacing: '-0.03em' }],
        '4xl':['2.25rem',  { lineHeight: '2.5rem',   letterSpacing: '-0.035em' }],
        '5xl':['3rem',     { lineHeight: '1',         letterSpacing: '-0.04em' }],
      },

      letterSpacing: {
        widest: '0.2em',
        label: '0.12em',
        tight: '-0.02em',
      },

      borderRadius: {
        sm: '0.1875rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },

      boxShadow: {
        'gold-sm':  '0 0 0 1px rgba(198,151,63,0.2)',
        'gold':     '0 0 12px rgba(198,151,63,0.15), 0 0 0 1px rgba(198,151,63,0.25)',
        'gold-lg':  '0 0 24px rgba(198,151,63,0.2), 0 0 0 1px rgba(198,151,63,0.3)',
        'panel':    '0 4px 24px rgba(0,0,0,0.5)',
        'panel-lg': '0 8px 48px rgba(0,0,0,0.7)',
        'inset':    'inset 0 1px 0 rgba(255,255,255,0.04)',
      },

      transitionDuration: {
        DEFAULT: '200ms',
        fast: '120ms',
        slow: '350ms',
      },

      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        luxury: 'cubic-bezier(0.25, 0, 0, 1)',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #C6973F 0%, #DEB96A 50%, #C6973F 100%)',
        'gradient-surface': 'linear-gradient(180deg, #181818 0%, #121212 100%)',
        'hairline-x': 'linear-gradient(90deg, transparent, rgba(198,151,63,0.3) 50%, transparent)',
        'hairline-y': 'linear-gradient(180deg, transparent, rgba(198,151,63,0.3) 50%, transparent)',
      },

      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },
      animation: {
        'fade-in':        'fade-in 0.3s cubic-bezier(0.25, 0, 0, 1) both',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.25, 0, 0, 1) both',
        shimmer:          'shimmer 1.6s linear infinite',
        'pulse-slow':     'pulse 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
