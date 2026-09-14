/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0D1117",
        surfacedark: "#151B23",
        surfacedark2: "#1C242F",
        paper: "#F6F5F1",
        surfacelight: "#FFFFFF",
        brand: {
          DEFAULT: "#F2B705",
          dark: "#C99A04",
          light: "#FFD65C",
        },
        income: "#22C55E",
        expense: "#F43F5E",
        muted: "#8B94A3",
        line: "#26303B",
        lineLight: "#E4E1D8",
      },
      fontFamily: {
        body: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
        mono: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px -12px rgba(0,0,0,0.15)",
        cardDark: "0 1px 2px rgba(0,0,0,0.3), 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
      keyframes: {
        loaderDot: {
          "0%, 80%, 100%": { opacity: "0.35", transform: "scale(0.75)" },
          "40%": { opacity: "1", transform: "scale(1)" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        popIn: {
          "0%": { opacity: 0, transform: "scale(0.96)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.35s ease-out both",
        popIn: "popIn 0.2s ease-out both",
        loaderDot: "loaderDot 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
