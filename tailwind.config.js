
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        meridian: {
          navy: "#071B2B",
          teal: "#087E8B",
          cyan: "#20C5C7",
          background: "#F3F6FA",
          surface: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
