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
        pastel: {
          bg: {
            light: "#f8fafc",
            dark: "#0f172a",
          },
          blue: {
            light: "#e0f2fe",
            dark: "#0369a1",
          },
          green: {
            light: "#dcfce7",
            dark: "#15803d",
          },
          yellow: {
            light: "#fef9c3",
            dark: "#a16207",
          },
          purple: {
            light: "#f3e8ff",
            dark: "#7e22ce",
          },
          rose: {
            light: "#ffe4e6",
            dark: "#be123c",
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
