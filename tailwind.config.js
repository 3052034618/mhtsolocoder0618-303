/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          50: '#E8EDF5',
          100: '#D1DBEB',
          200: '#A3B7D7',
          300: '#7593C3',
          400: '#476FAF',
          500: '#3A649E',
          600: '#2E4F80',
          700: '#253D66',
          800: '#1B2A4A',
          900: '#0F1A2E',
          950: '#080E1A',
        },
        amber: {
          50: '#FEF7ED',
          100: '#FDECD4',
          200: '#FBD5A8',
          300: '#F5C07A',
          400: '#F0A854',
          500: '#E8913A',
          600: '#D07520',
          700: '#A05A18',
          800: '#7A4414',
          900: '#5C3310',
        },
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
        sans: ['Noto Sans SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
