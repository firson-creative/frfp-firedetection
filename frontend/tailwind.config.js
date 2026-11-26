module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          emerald: "#10B981",
          emeraldLight: "#34D399",
          emeraldDark: "#059669",
          forest: "#061412",
          darkForest: "#030D0B",
          deepForest: "#08231C",
          surface: "rgba(8, 35, 28, 0.75)",
          surfaceGlass: "rgba(10, 42, 34, 0.65)",
          borderGlass: "rgba(16, 185, 129, 0.2)",
          cardGlass: "rgba(6, 24, 20, 0.82)",
        },
        risk: {
          high: "#EF4444",
          highDark: "#DC2626",
          low: "#10B981",
          warning: "#F59E0B",
          info: "#06B6D4",
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-emerald": "0 8px 32px 0 rgba(16, 185, 129, 0.15)",
        "glow-emerald": "0 0 20px rgba(16, 185, 129, 0.35)",
        "glow-high": "0 0 20px rgba(239, 68, 68, 0.4)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
