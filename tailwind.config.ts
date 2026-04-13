import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        block: {
          pulse: "#FF6B6B",
          gallop: "#4ECDC4",
          syncopated: "#FFE66D",
          longtone: "#95E1D3",
          skip: "#DDA0DD",
        },
      },
    },
  },
  plugins: [],
};

export default config;
