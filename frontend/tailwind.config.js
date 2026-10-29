/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        filyon: {
          bg: '#090d16',
          card: '#0f172a',
          cardHover: '#1e293b',
          border: '#1e293b',
          cyan: '#06b6d4',
          blue: '#0284c7',
          emerald: '#10b981',
          amber: '#f59e0b',
          crimson: '#ef4444',
          purple: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
