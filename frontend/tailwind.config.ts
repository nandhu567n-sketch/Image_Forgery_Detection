import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FDFCF8',      // Rice Paper
        foreground: '#2C2C24',      // Deep Loam
        primary: {
          DEFAULT: '#5D7052',       // Moss Green
          foreground: '#F3F4F1',    // Pale Mist
          light: '#768B6A',
          dark: '#45543D',
        },
        secondary: {
          DEFAULT: '#C18C5D',       // Terracotta / Clay
          foreground: '#FFFFFF',
          light: '#D4A478',
          dark: '#A67245',
        },
        accent: {
          DEFAULT: '#E6DCCD',       // Sand / Beige
          foreground: '#4A4A40',    // Bark
        },
        muted: {
          DEFAULT: '#F0EBE5',       // Stone
          foreground: '#78786C',    // Dried Grass
        },
        border: {
          DEFAULT: '#DED8CF',       // Raw Timber
          light: '#EBE6DE',
        },
        destructive: {
          DEFAULT: '#A85448',       // Burnt Sienna
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#FEFEFA',       // Warm Alabaster
          foreground: '#2C2C24',
        },
        loam: '#2C2C24',
        moss: '#5D7052',
        clay: '#C18C5D',
        sand: '#E6DCCD',
        stone: '#F0EBE5',
        timber: '#DED8CF',
        bark: '#4A4A40',
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Nunito"', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif'],
        mono: ['"Nunito"', 'sans-serif'], // Pure Organic mode: map mono classes to rounded Nunito
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        'blob-1': '60% 40% 30% 70% / 60% 30% 70% 40%',
        'blob-2': '30% 70% 70% 30% / 30% 30% 70% 70%',
        'blob-3': '50% 50% 30% 70% / 50% 60% 40% 50%',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(93, 112, 82, 0.15)',
        'float': '0 10px 40px -10px rgba(193, 140, 93, 0.2)',
        'earth': '0 8px 30px -4px rgba(74, 74, 64, 0.08)',
        'card-hover': '0 20px 40px -10px rgba(93, 112, 82, 0.18)',
      },
      transitionDuration: {
        DEFAULT: '300ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
