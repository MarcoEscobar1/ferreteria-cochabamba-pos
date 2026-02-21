/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef7ee',
          100: '#fdedd3',
          200: '#f9d7a5',
          300: '#f5b96d',
          400: '#f09332',
          500: '#ec7a12',
          600: '#dd5f08',
          700: '#b74609',
          800: '#92380e',
          900: '#76300f',
          950: '#401605',
        },
        steel: {
          50: '#f6f7f9',
          100: '#ecedf2',
          200: '#d5d7e2',
          300: '#b1b5c8',
          400: '#868ca9',
          500: '#676e8f',
          600: '#525776',
          700: '#434760',
          800: '#3a3d51',
          900: '#333546',
          950: '#22232e',
        },
      },
      fontFamily: {
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
