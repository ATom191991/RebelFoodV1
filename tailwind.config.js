/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        charcoal: {
          950: "#0d0d0f",
          900: "#141417",
          850: "#1a1a1e",
          800: "#202024",
          700: "#2b2b30",
          600: "#3a3a41",
          500: "#55555e",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f6f6f7",
          alt: "#f0f0f2",
          border: "#e4e4e7",
        },
        brand: {
          red: "#d92d3c",
          redDark: "#b21f2d",
          redSoft: "#fdeced",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,15,17,0.04), 0 1px 8px rgba(15,15,17,0.04)",
        pop: "0 8px 24px rgba(15,15,17,0.12)",
      },
      borderRadius: {
        xl2: "14px",
      },
    },
  },
  plugins: [],
};
