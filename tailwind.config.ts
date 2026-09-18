import type { Config } from "tailwindcss";
export default {
  darkMode: "class",
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
        accent: "#EB5815",
        // Agency Control Panel tokens (CSS-variable-backed)
        cp: {
          background: "hsl(var(--cp-background))",
          foreground: "hsl(var(--cp-foreground))",
          card: "hsl(var(--cp-card))",
          "card-fg": "hsl(var(--cp-card-foreground))",
          primary: "hsl(var(--cp-primary))",
          "primary-fg": "hsl(var(--cp-primary-foreground))",
          secondary: "hsl(var(--cp-secondary))",
          muted: "hsl(var(--cp-muted))",
          "muted-fg": "hsl(var(--cp-muted-foreground))",
          border: "hsl(var(--cp-border))",
        },
      },
      borderRadius: {
        cp: "var(--cp-radius)",
      },
      fontFamily: {
        sans: [
          "Wix Madefor Text",
          "WixMadeforText",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: { soft: "0 10px 30px rgba(0,0,0,0.25)" }
    }
  },
  plugins: []
} satisfies Config;
