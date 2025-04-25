import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "glitch-1": {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-5px, 5px)" },
          "40%": { transform: "translate(-5px, -5px)" },
          "60%": { transform: "translate(5px, 5px)" },
          "80%": { transform: "translate(5px, -5px)" },
        },
        "glitch-2": {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(5px, 5px)" },
          "40%": { transform: "translate(5px, -5px)" },
          "60%": { transform: "translate(-5px, 5px)" },
          "80%": { transform: "translate(-5px, -5px)" },
        },
        "gradient-x": {
          "0%, 100%": { 
            "background-position": "0% 50%", 
            "background-size": "200% 200%" 
          },
          "50%": { 
            "background-position": "100% 50%", 
            "background-size": "200% 200%" 
          },
        },
        "fade-in-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.7)", opacity: "0" },
          "50%": { opacity: "0.5" },
          "100%": { transform: "scale(1.2)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glitch-1": "glitch-1 0.7s infinite linear alternate-reverse",
        "glitch-2": "glitch-2 0.7s infinite linear alternate-reverse",
        "gradient-x": "gradient-x 10s ease infinite",
        "fade-in-down": "fade-in-down 0.5s ease-out forwards",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
