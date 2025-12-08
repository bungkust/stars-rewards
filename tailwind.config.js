/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        muted: "rgb(var(--muted) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
      }
    },
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
  ],
  daisyui: {
    themes: [
      {
        childTheme: {
          "primary": "#38BDF8",
          "secondary": "#99E6C9",
          "accent": "#FFCC99",
          "neutral": "#013576",
          "base-100": "#FFFFFF",
          "info": "#A6E9FF",
          "success": "#5FE28A",
          "warning": "#FFD580",
          "error": "#FF6B6B",
          "--muted": "71 85 105",
          "--surface": "251 253 255",
        },
        parentTheme: {
          "primary": "#ABC270",
          "secondary": "#FEC868",
          "accent": "#FDA769",
          "neutral": "#463C33",
          "base-100": "#F9FAFB",
          "info": "#A6E9FF",
          "success": "#7ADF93",
          "warning": "#FFCC99",
          "error": "#C83F49",
          "--muted": "85 98 112",
          "--surface": "255 255 255",
        },
      },
    ],
  },
}

