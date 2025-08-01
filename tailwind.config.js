
module.exports = {
  content: [
    "./*.{jsx, js, html}",
    ".{jsx, js, html}",
    "./src/*.{jsx, js, html}",
    "./src/**/*.{jsx,js, html}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
}