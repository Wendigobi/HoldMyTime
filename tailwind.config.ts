// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./pages/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Black & Gold palette
        bg: "#0b0b0f",
        panel: "#121218",
        gold: {
          DEFAULT: "#d4af37",
          soft: "#f0d678",
          deep: "#a98b2b",
        },
        ink: "#e8e8ea",
        mute: "#9aa0aa",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(212,175,55,0.35), 0 10px 40px rgba(212,175,55,0.08)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
    },
  },
  plugins: [],
};

export default config;
