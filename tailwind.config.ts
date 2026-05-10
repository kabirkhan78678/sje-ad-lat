import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefbf6',
          100: '#d6f5e7',
          200: '#b0ead2',
          300: '#79d7b5',
          400: '#42ba92',
          500: '#1f9f78',
          600: '#157e5f',
          700: '#14664f',
          800: '#155141',
          900: '#144337',
          950: '#07261f',
        },
        accent: {
          50: '#fff9eb',
          100: '#fff0c6',
          200: '#ffe08a',
          300: '#ffc949',
          400: '#ffb11f',
          500: '#f98f07',
          600: '#dd6802',
          700: '#b74606',
          800: '#94370c',
          900: '#7a2f0d',
          950: '#461604',
        },
      },
      boxShadow: {
        soft: '0 12px 30px rgba(15, 23, 42, 0.08)',
        panel: '0 10px 25px rgba(15, 23, 42, 0.06)',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      backgroundImage: {
        'panel-gradient':
          'linear-gradient(135deg, rgba(31,159,120,0.12), rgba(249,143,7,0.10), rgba(255,255,255,0.96))',
      },
    },
  },
  plugins: [],
} satisfies Config;
