/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        gravel: "#121212",
        snow: "#FFFFFF",
        cloud: "#f6f6f1",
        sun: "#FEF278",
        clementine: "#FF7F32",
        rain: "#ACDDFF",
        monstera: "#B9E29A",
        rock: "#B9B9B4",
        pebble: "#1D1D1D",
        offWhite: "#F8F0E3",
        cloudDarker: "#ecece7",
        cloudLighter: "#fbfbf8",
        darkCharcoal: "#303030",
        semiWhite: "#FFFFFFDE",
      },
      fontFamily: {
        pp: ["PPObjectSans-Regular"],
      },
    },
  },
  plugins: [],
}