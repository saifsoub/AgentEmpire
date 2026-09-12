import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: "#05070F",
        surface: "#0D1422",
        surface2: "#151F32",
        border: "#28344C",
        primary: "#EEF3FA",
        secondary: "#B8C4D4",
        muted: "#76849D",
        accent: "#D4B45F"
      },
      boxShadow: { soft: "0 10px 30px rgba(0,0,0,0.25)" }
    }
  },
  plugins: []
} satisfies Config;
