/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tracked-primary': {
          DEFAULT: '#25246A',
          light: '#3a3896',
          dark: '#1a1a4e',
        },
        'tracked-secondary': {
          DEFAULT: '#D2A204',
          light: '#e5b835',
          dark: '#a88203',
        },
      },
    },
  },
  plugins: [],
}
