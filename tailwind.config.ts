import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#E9EBF0",
        surface: "#FFFFFF",
        ink: "#20222E",
        inksoft: "#5A5F6E",
        hairline: "#E6E8EE",
        mark: "#F6C445",
        markdim: "#FBE7A6",
        danger: "#C0453B",
        dangertint: "#FBEBE9",
        success: "#2F7D5B",
        successtint: "#E7F3EC",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(32,34,46,0.04), 0 8px 24px -12px rgba(32,34,46,0.12)",
        cardactive: "0 2px 4px rgba(32,34,46,0.06), 0 16px 40px -16px rgba(32,34,46,0.20)",
      },
    },
  },
  plugins: [],
} satisfies Config;
