/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        maroon: "#6B0F1A",
        ember: "#E05A2B",
        ink: "#111113",
        coal: "#1A1A1D",
        mist: "#F8F9FA"
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Arial", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Plus Jakarta Sans", "Arial", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 45px rgba(17,17,19,0.12)"
      }
    }
  },
  plugins: []
};
