import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: "#0A0F1A",
        surface: "#121826",
        surface2: "#182133",
        border: "#27324A",
        primary: "#F3F6FB",
        secondary: "#B8C2D6",
        muted: "#7E8AA3",
        accent: "#EB5815"
      },
      boxShadow: { soft: "0 10px 30px rgba(0,0,0,0.25)" }
    }
  },
  plugins: []
} satisfies Config;
