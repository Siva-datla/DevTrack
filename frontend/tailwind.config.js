/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          leetcode: '#FFA116',
          codeforces: '#318CE7',
          hackerrank: '#00EA64',
        },
      },
    },
  },
  plugins: [],
};
