/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#142B4A",
          deepBlue: "#1D4E89",
          cyan: "#20B8D5",
          darkBg: "#0F1E36",
          cardBg: "#172A45"
        },
        risk: {
          high: "#DC2626",
          low: "#16A34A",
          warning: "#F59E0B"
        }
      }
    },
  },
  plugins: [],
};
