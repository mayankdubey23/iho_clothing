const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './resources/**/*.blade.php',
    './resources/**/*.js',
    './resources/**/*.jsx',
    './resources/**/*.vue',
    './resources/**/*.ts',
    './resources/**/*.tsx',
    './public/index.php',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F8F9FA',
          100: '#E9ECEF',
          200: '#DEE2E6',
          300: '#CED4DA',
          400: '#ADB5BD',
          500: '#6C757D',
          600: '#495057',
          700: '#343A40',
          800: '#212529',
          900: '#1A1A2E',
        },
        brand: {
          dark: '#1A1A2E',
          navy: '#16213E',
          accent: '#E94E3C',
          accentHover: '#D63A2A',
          secondary: '#0F3460',
          light: '#F8F9FA',
        },
        sport: {
          black: '#0A0A0F',
          charcoal: '#1A1A2E',
          red: '#E94E3C',
          orange: '#FF6B35',
          white: '#FFFFFF',
          gray: '#F5F5F7',
        }
      },
      fontFamily: {
        // Inter for extremely clean, readable product details and menus
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        // Montserrat for premium, wider headings
        heading: ['Montserrat', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};