/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        accent: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          light: '#dbeafe',
        },
        success: {
          DEFAULT: '#059669',
          light: '#d1fae5',
        },
        warning: {
          DEFAULT: '#d97706',
          light: '#fed7aa',
        },
        error: {
          DEFAULT: '#dc2626',
          light: '#fee2e2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.75' }],
        lg: ['1.125rem', { lineHeight: '1.75' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.25' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.25rem', { lineHeight: '1.25' }],
      },
      borderRadius: {
        DEFAULT: '6px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 4px 12px rgba(0, 0, 0, 0.05)',
        md: '0 6px 16px rgba(0, 0, 0, 0.08)',
        lg: '0 12px 24px rgba(0, 0, 0, 0.10)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
