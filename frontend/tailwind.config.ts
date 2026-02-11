import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // We use the name we defined in CSS above
        mercedes: ["MercedesManual", "sans-serif"], 
        sans: ["var(--font-geist-sans)", "sans-serif"],
      },
      // ... keep your backgroundImage and other settings ...
    },
  },
  plugins: [],
};
export default config;