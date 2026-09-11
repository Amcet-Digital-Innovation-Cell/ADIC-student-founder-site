import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        /* Luxury Palette */
        "black-leather":  "var(--color-black-leather)",
        "rosso-onyx":     "var(--color-rosso-onyx)",
        "blush-suede":    "var(--color-blush-suede)",
        "champagne-gold": "var(--color-champagne-gold)",
        "deep-charcoal":  "var(--color-deep-charcoal)",
        "soft-cream":     "var(--color-soft-cream)",
        "muted-taupe":    "var(--color-muted-taupe)",

        /* Semantic tokens */
        primary:          "var(--primary)",
        "primary-hover":  "var(--primary-hover)",
        "primary-light":  "var(--primary-light)",
        "primary-soft":   "var(--primary-soft)",
        secondary:        "var(--secondary)",
        "deep-bottle":    "var(--deep-bottle)",
        bg:               "var(--bg)",
        "bg-dark":        "var(--bg-dark)",
        surface:          "var(--surface)",
        "surface-dark":   "var(--surface-dark)",
        "surface-green":  "var(--surface-green)",
        "warm-surface":   "var(--warm-surface)",
        "text-primary":   "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted":     "var(--text-muted)",
        "text-on-dark":   "var(--text-on-dark)",
        border:           "var(--border)",
        "border-strong":  "var(--border-strong)",
        divider:          "var(--divider)",
        gold:             "var(--gold)",
        "gold-soft":      "var(--gold-soft)",

        /* Legacy aliases */
        ink:     "var(--ink)",
        paper:   "var(--paper)",
        mustard: "var(--mustard)",
        sage:    "var(--sage)",
        rust:    "var(--rust)",
        line:    "var(--line)",
        char:    "var(--char)",
      },
      fontFamily: {
        sans:    ["Inter", "Manrope", "system-ui", "sans-serif"],
        serif:   ["Cormorant Garamond", "Georgia", "serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
        mono:    ["ui-monospace", "monospace"],
      },
      boxShadow: {
        card:          "0 1px 6px rgba(17,17,17,0.06), 0 1px 2px rgba(17,17,17,0.04)",
        "card-hover":  "0 12px 40px rgba(17,17,17,0.10), 0 2px 8px rgba(17,17,17,0.06)",
        "btn-primary": "0 4px 20px rgba(184,149,104,0.20)",
        gold:          "0 4px 20px rgba(184,149,104,0.20)",
        warm:          "0 8px 32px rgba(17,17,17,0.08), 0 1px 4px rgba(17,17,17,0.04)",
        modal:         "0 24px 80px rgba(17,17,17,0.30), 0 4px 20px rgba(17,17,17,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
