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
        palette: {
          blackForest: '#143109',
          drySage: '#AAAE7F',
          beige: '#D0D6B3',
          brightSnow: '#F7F7F7',
          platinum: '#EFEFEF',
        },
        pastel: {
          bg: {
            light: "#F7F7F7",
            dark: "#143109",
          },
          green: {
            light: "#D0D6B3",
            dark: "#143109",
          },
          sage: {
            light: "#AAAE7F",
            dark: "#143109",
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
