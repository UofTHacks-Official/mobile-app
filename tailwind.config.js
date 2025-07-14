/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"],
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
        uoft_blue_light: "#E3F2FD",
        uoft_orange_light: "#FFF3E0", 
        uoft_purple_light: "#F0E6FF",
        navBar: "#1A1819",
        navBar1: "#2F2E2C",
        navIconColor: "#BFBDBE"
      },
      fontFamily: {
        // Onest fonts
        'onest': ['Onest-Regular', 'sans-serif'],
        'onest-thin': ['Onest-Thin', 'sans-serif'],
        'onest-extralight': ['Onest-ExtraLight', 'sans-serif'],
        'onest-light': ['Onest-Light', 'sans-serif'],
        'onest-medium': ['Onest-Medium', 'sans-serif'],
        'onest-semibold': ['Onest-SemiBold', 'sans-serif'],
        'onest-bold': ['Onest-Bold', 'sans-serif'],
        'onest-extrabold': ['Onest-ExtraBold', 'sans-serif'],
        'onest-black': ['Onest-Black', 'sans-serif'],
        
        // Open Sans fonts
        'opensans': ['OpenSans-Regular', 'sans-serif'],
        'opensans-light': ['OpenSans-Light', 'sans-serif'],
        'opensans-medium': ['OpenSans-Medium', 'sans-serif'],
        'opensans-semibold': ['OpenSans-SemiBold', 'sans-serif'],
        'opensans-bold': ['OpenSans-Bold', 'sans-serif'],
        'opensans-extrabold': ['OpenSans-ExtraBold', 'sans-serif'],
        
        // Open Sans Condensed fonts
        'opensans-condensed': ['OpenSans_Condensed-Regular', 'sans-serif'],
        'opensans-condensed-light': ['OpenSans_Condensed-Light', 'sans-serif'],
        'opensans-condensed-medium': ['OpenSans_Condensed-Medium', 'sans-serif'],
        'opensans-condensed-semibold': ['OpenSans_Condensed-SemiBold', 'sans-serif'],
        'opensans-condensed-bold': ['OpenSans_Condensed-Bold', 'sans-serif'],
        'opensans-condensed-extrabold': ['OpenSans_Condensed-ExtraBold', 'sans-serif'],
        
        // Open Sans SemiCondensed fonts
        'opensans-semicondensed': ['OpenSans_SemiCondensed-Regular', 'sans-serif'],
        'opensans-semicondensed-light': ['OpenSans_SemiCondensed-Light', 'sans-serif'],
        'opensans-semicondensed-medium': ['OpenSans_SemiCondensed-Medium', 'sans-serif'],
        'opensans-semicondensed-semibold': ['OpenSans_SemiCondensed-SemiBold', 'sans-serif'],
        'opensans-semicondensed-bold': ['OpenSans_SemiCondensed-Bold', 'sans-serif'],
        'opensans-semicondensed-extrabold': ['OpenSans_SemiCondensed-ExtraBold', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

