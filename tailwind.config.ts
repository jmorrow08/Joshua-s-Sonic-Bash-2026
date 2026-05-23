import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sonic: {
          blue: "#0A2A6B",
          electric: "#1E4DD8",
          sky: "#3B82F6",
          gold: "#F5C518",
          red: "#E11D2E",
          cream: "#FFF8E7",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        sonic: "0 10px 40px -10px rgba(30, 77, 216, 0.45)",
        gold: "0 10px 40px -10px rgba(245, 197, 24, 0.55)",
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "pulse-glow": "pulseGlow 2.4s ease-in-out infinite",
        "bounce-slow": "bounce 2.5s infinite",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245, 197, 24, 0.6)" },
          "50%": { boxShadow: "0 0 0 14px rgba(245, 197, 24, 0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
