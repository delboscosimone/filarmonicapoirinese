import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#080808',
        surface: '#111111',
        border:  '#222222',
        red: {
          DEFAULT: '#B22222',
          light:   '#CC3333',
          dark:    '#8B1A1A',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#E2C170',
          dark:    '#9A7A28',
        },
        cream: '#F0EBE0',
        muted: '#7A6A58',
        blue: {
          band:    '#3B82F6',
          bandark: '#1D4ED8',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        body:    ['var(--font-garamond)', 'serif'],
        ui:      ['var(--font-cinzel)', 'serif'],
      },
      animation: {
        fadeInUp:    'fadeInUp 0.8s ease both',
        fadeIn:      'fadeIn 1s ease both',
        expandLine:  'expandLine 1s ease both',
        shimmer:     'shimmer 2s infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        expandLine: {
          from: { width: '0%', opacity: '0' },
          to:   { width: '100%', opacity: '1' },
        },
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
