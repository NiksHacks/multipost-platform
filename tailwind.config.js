/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './types/**/*.ts',
  ],
  theme: {
    extend: {
      colors: {
        'youtube': '#FF0000',
        'instagram': '#E4405F',
        'tiktok': '#000000',
        'linkedin': '#0077B5',
        'reddit': '#FF4500',
      },
    },
  },
  plugins: [],
}