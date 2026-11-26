module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Momo Trust Display"', '"Kumbh Sans"', "system-ui", "sans-serif"],
        sans: ['"Kumbh Sans"', "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        brand: {
          emerald: "#10B981",
          emeraldLight: "#34D399",
          emeraldDark: "#059669",
        },
        risk: {
          high: "#EF4444",
          highDark: "#DC2626",
          low: "#10B981",
          warning: "#F59E0B",
          info: "#06B6D4",
        },
      },
    },
  },
  plugins: [],
};
