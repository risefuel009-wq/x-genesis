import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          50: '#f7f7fa',
          100: '#efeff5',
          200: '#dddee8',
          300: '#cbccdb',
          400: '#b9bace',
          500: '#a7a8c1',
          600: '#959699',
          700: '#838494',
          800: '#4a4d57',
          900: '#1a1d23',
          950: '#0f1117',
        },
        gold: {
          50: '#fefdf8',
          100: '#fffbf0',
          200: '#fff5d8',
          300: '#ffefc0',
          400: '#ffe9a8',
          500: '#ffe390',
          600: '#ffd700',
          700: '#d4af37',
          800: '#9d7f1a',
          900: '#6b5b0e',
          950: '#3d3407',
        },
      },
    },
  },
  plugins: [],
};

export default config;
