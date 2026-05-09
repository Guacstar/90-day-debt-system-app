import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        calm: {
          50: "#f4fbfa",
          100: "#d9f2ee",
          500: "#2f9c8f",
          700: "#1f6e67",
          900: "#173f3c"
        },
        sand: "#f7f2ea"
      },
      boxShadow: { soft: "0 18px 45px rgba(31, 56, 68, 0.10)" }
    }
  },
  plugins: []
};
export default config;
