/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./frontend/publik/index.html",
    "./frontend/publik/js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#004b24",
        "primary-container": "#006633",
        secondary: "#745b00",
        "secondary-container": "#fecb00",
        background: "#fbf9f8",
        surface: "#fbf9f8",
        "on-surface": "#1b1c1c",
        "on-surface-variant": "#3f4940",
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans"],
        body: ["Inter"],
        label: ["Work Sans"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
