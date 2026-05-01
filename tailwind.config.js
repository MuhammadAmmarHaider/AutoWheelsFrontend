/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Custom brand colors
        primary: {
          light: "#032d42",
          dark: "#1a5a6f",
          DEFAULT: "#032d42",
        },
        success: {
          light: "#63df4e",
          dark: "#4fb035",
          DEFAULT: "#63df4e",
        },
        accent: {
          light: "#338b9d",
          dark: "#338b9d",
          DEFAULT: "#338b9d",
        },
        // Semantic colors for light mode
        "light-bg": "#ffffff",
        "light-surface": "#f8f9fa",
        "light-text": "#11181C",
        "light-text-secondary": "#687076",
        "light-border": "#e5e7eb",

        // Semantic colors for dark mode
        "dark-bg": "#0f1419",
        "dark-surface": "#1a1f26",
        "dark-text": "#ecedee",
        "dark-text-secondary": "#9ba1a6",
        "dark-border": "#2d3748",
      },
      backgroundColor: {
        "app-light": "#ffffff",
        "app-dark": "#0f1419",
      },
      textColor: {
        "app-light": "#11181C",
        "app-dark": "#ecedee",
      },
    },
  },
  plugins: [],
};
