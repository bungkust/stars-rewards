/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
  ],
  daisyui: {
    themes: [
      {
        softBlueTheme: {
          "primary": "#8FB3FF",
          "secondary": "#99E6C9",
          "warning": "#FFCC99",
          "base-100": "#F9FAFB",
        },
      },
    ],
  },
}

