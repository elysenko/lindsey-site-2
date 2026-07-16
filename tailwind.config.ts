import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/content/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0e1a2b',
          soft: '#1c2c42',
          muted: '#4a5a72',
        },
        parchment: {
          DEFAULT: '#f6f3ec',
          deep: '#ece7db',
        },
        gold: {
          DEFAULT: '#b7873f',
          soft: '#c99b52',
          deep: '#8f6a2f',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};

export default config;
