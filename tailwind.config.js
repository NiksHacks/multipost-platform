/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
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