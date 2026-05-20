/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        dm: ["DM Sans", "sans-serif"],
      },
      colors: {
        bg: "#0a0e1a",
        surface: "#111827",
        surface2: "#1a2235",
        border: "#1e3052",
        accent: "#00d4ff",
        accent2: "#7c3aed",
        success: "#10b981",
      },
    },
  },
  plugins: [],
};