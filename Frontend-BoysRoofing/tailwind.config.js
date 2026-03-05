/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "br-carbon": "#0B090A",
        "br-smoke": "#161A1D",
        "br-red-deep": "#660708",
        "br-red-dark": "#A4161A",
        "br-red-main": "#BA181B",
        "br-red-light": "#E5383B",
        "br-red-muted": "#8B6B6C",
        "br-red-soft": "#6B4A4B",
        "br-blue-muted": "#4A5F6E",
        "br-stone": "#B1A7A6",
        "br-pearl": "#D3D3D3",
        "br-smoke-light": "#F5F3F4",
        "br-white": "#FFFFFF",
      },
      borderRadius: {
        "br-sm": "0.375rem",
        "br-md": "0.5rem",
        "br-lg": "0.75rem",
        "br-xl": "1rem",
        "br-2xl": "1.25rem",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
        body: ["var(--font-roboto)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
