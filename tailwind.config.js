/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 自定义一些"圈内"高级灰
        'ym-bg': '#f5f5f7',
        'ym-dark': '#1d1d1f',
      }
    },
  },
  plugins: [],
}