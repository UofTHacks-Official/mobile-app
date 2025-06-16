/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        uoft_primary_blue: "#2A398C",
        uoft_secondary_orange: "#FF6F51",
        uoft_accent_purple: "#E9B6F7",
        uoft_accent_red: "#F85C5C",
        uoft_accent_cream: "#F3E7E3",
        uoft_black: "#181818",
        uoft_white: "#F6F6F6",
        uoft_stark_white: "#FFFFFF",
        uoft_grey_light: "#C6C6C6",
        uoft_grey_medium: "#A0A0A0",
        uoft_grey_lighter: "#E0E0E0",
        uoft_dark_grey: "#ecece7",
        uoft_light_grey: "#fbfbf8",
      },
      fontFamily: {
        pp: ["PPObjectSans-Regular"],
      },
    },
  },
  plugins: [],
}