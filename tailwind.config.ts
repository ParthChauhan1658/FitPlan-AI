import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ── Brand design tokens: Neon Coral + Space Black ──────────────
        // Backgrounds
        "brand-navy":   "#121313",   // Space Black — main page bg
        "brand-dark":   "#0D0D0D",   // Deeper black — sidebar/header
        "brand-surface": "rgba(255,255,255,0.04)",
        // Primary — Neon Coral
        "brand-teal":      "#FF6044", // Primary CTA, active states, links
        "brand-teal-dim":  "#E8543A", // Hovered / pressed state
        // Secondary — Warm Amber (replaces purple)
        "brand-purple":       "#CC7722", // Ambient tint base (used at /10 opacity)
        "brand-purple-light": "#FFB347", // Warm amber text accent
        // Tertiary — stays Amber
        "brand-amber":       "#FFB347", // Calories, favorites, budget (warm)
        "brand-amber-light": "#FFD080", // Lighter warm accent
        // Health / Success — Mint Green
        "brand-mint":        "#3DD68C", // Success states, health indicators
        "brand-mint-light":  "#6EE7A8", // Lighter mint
        // UI helpers
        "brand-muted":  "#6B7280",
        "brand-border": "rgba(255,96,68,0.10)", // Coral-tinted borders
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // shadcn
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Brand
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "gradient-flow": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":       { backgroundPosition: "100% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255,96,68,0.30)" },
          "50%":       { boxShadow: "0 0 40px rgba(255,96,68,0.55)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-12px)" },
        },
        "mesh-drift": {
          "0%, 100%": { backgroundPosition: "0px 0px" },
          "50%":       { backgroundPosition: "20px 20px" },
        },
        "counter-up": {
          "0%":   { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in-up":     "fade-in-up 0.6s ease-out forwards",
        "fade-in":        "fade-in 0.4s ease-out forwards",
        "gradient-flow":  "gradient-flow 4s ease infinite",
        "pulse-glow":     "pulse-glow 2s ease-in-out infinite",
        float:            "float 3s ease-in-out infinite",
        "mesh-drift":     "mesh-drift 8s ease-in-out infinite",
        "counter-up":     "counter-up 0.4s ease-out forwards",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(({ addUtilities }) => {
      const delays: Record<string, { animationDelay: string }> = {};
      for (let i = 1; i <= 6; i++) {
        delays[`.animation-delay-${i * 100}`] = { animationDelay: `${i * 100}ms` };
      }
      addUtilities(delays);
    }),
  ],
} satisfies Config;

export default config;
