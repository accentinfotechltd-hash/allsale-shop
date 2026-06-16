/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        background: "#FAFAF9",
        surface: "#FFFFFF",
        foreground: "#0F172A",
        muted: { DEFAULT: "#F1F5F9", foreground: "#475569" },
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#F97316",
        primary: {
          DEFAULT: "#F97316",
          hover: "#EA580C",
          foreground: "#FFFFFF",
        },
        seller: {
          DEFAULT: "#7C3AED",
          foreground: "#FFFFFF",
        },
        finance: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#FFF7ED",
          foreground: "#9A3412",
        },
        popover: { DEFAULT: "#FFFFFF", foreground: "#0F172A" },
        card: { DEFAULT: "#FFFFFF", foreground: "#0F172A" },
        secondary: { DEFAULT: "#F1F5F9", foreground: "#0F172A" },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "ui-sans-serif", "system-ui"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease forwards",
        "pop": "pop 0.4s ease",
        "marquee": "marquee 40s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
