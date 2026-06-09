/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        maroon: "#7A1022",
        ember: "#F97316",
        ink: "#111113",
        coal: "#1A1A1D",
        mist: "#F7F8FA"
      },
      fontFamily: {
        sans: ["Roboto", "Arial", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Roboto Condensed", "Roboto", "Arial", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 45px rgba(17,17,19,0.12)"
      }
    }
  },
  plugins: []
};
