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
        "br-stone": "#B1A7A6",
        "br-pearl": "#D3D3D3",
        "br-smoke-light": "#F5F3F4",
        "br-white": "#FFFFFF",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
        body: ["var(--font-roboto)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
