/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Greys and Whites
        "space-grey": "#181818",
        "grey-900": "#2D2D2D",
        "grey-800": "#3D3D3D",
        "grey-700": "#525252",
        "grey-600": "#737373",
        "grey-500": "#8B8B8B",
        "grey-400": "#A3A3A3",
        "grey-300": "#C4C4C4",
        "grey-200": "#E5E5E5",
        "primary-white": "#FFFFFF",

        // Warm Colors
        "orange-600": "#EA7C3C",
        "orange-500": "#F2924E",
        "orange-300": "#F5D19B",
        "yellow-300": "#F5E89B",

        // Pinks
        "pink-600": "#B44D7A",
        "pink-500": "#D36FA0",
        "pink-300": "#F2B6D4",

        // Blues and Teals
        "blue-800": "#1E3A5F",
        "blue-700": "#2E5984",
        "blue-600": "#4A7BA7",
        "blue-500": "#6FB4F0",
        "teal-500": "#7DD3D8",
        "teal-300": "#B8E6EA",
        "cyan-light": "#BFF6FF", // Timer progress ring - dark mode
        "blue-dark": "#21516B", // Timer progress ring - light mode

        // Feedback Colors
        "red-600": "#8B3A3A",
        "red-500": "#E57373",
        "red-300": "#FFCDD2",

        // Role Selection Colors
        role_admin: "#75EDEF",
        role_volunteer: "#F17AAD",
        role_judge: "#FF9F6E",
        role_hacker: "#FFDD80",

        // Legacy UofT Colors (keeping for backward compatibility)
        uoft_primary_blue_dark: "#132B38",
        uoft_primary_blue: "#75EDEF",
        uoft_yellow: "#FFDD80",
        uoft__orange: "#FF9F6E",
        uoft_pink: "#F17AAD",
        uoft_accent_purple: "#E9B6F7",
        uoft_accent_red: "#F85C5C",
        uoft_accent_cream: "#F3E7E3",
        uoft_grey: "#D3D3D3",

        uoft_black: "#181818",
        uoft_white: "#F6F6F6",
        light_bg: "#F6F5F8",

        uoft_dark_bg_black: "#1A1A1A",
        uoft_dark_mode_bg_light_black: "#262626",
        uoft_dark_mode_card: "#303030",
        uoft_dark_mode_text: "#808080",
        uoft_dark_bg: "#212121",
        uoft_light_mode_card: "#EBEBEA",

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
        navIconColor: "#BFBDBE",
      },
      fontFamily: {
        // Onest fonts with web fallbacks
        onest: ["Onest-Regular", "system-ui", "-apple-system", "sans-serif"],
        "onest-thin": [
          "Onest-Thin",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        "onest-extralight": [
          "Onest-ExtraLight",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        "onest-light": [
          "Onest-Light",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        "onest-medium": [
          "Onest-Medium",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        "onest-semibold": [
          "Onest-SemiBold",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        "onest-bold": [
          "Onest-Bold",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        "onest-extrabold": [
          "Onest-ExtraBold",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        "onest-black": [
          "Onest-Black",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],

        // Open Sans fonts with web fallbacks
        opensans: ["OpenSans-Regular", "Open Sans", "system-ui", "sans-serif"],
        "opensans-light": [
          "OpenSans-Light",
          "Open Sans",
          "system-ui",
          "sans-serif",
        ],
        "opensans-medium": [
          "OpenSans-Medium",
          "Open Sans",
          "system-ui",
          "sans-serif",
        ],
        "opensans-semibold": [
          "OpenSans-SemiBold",
          "Open Sans",
          "system-ui",
          "sans-serif",
        ],
        "opensans-bold": [
          "OpenSans-Bold",
          "Open Sans",
          "system-ui",
          "sans-serif",
        ],
        "opensans-extrabold": [
          "OpenSans-ExtraBold",
          "Open Sans",
          "system-ui",
          "sans-serif",
        ],

        // Open Sans Condensed fonts with web fallbacks
        "opensans-condensed": [
          "OpenSans_Condensed-Regular",
          "Open Sans Condensed",
          "system-ui",
          "sans-serif",
        ],
        "opensans-condensed-light": [
          "OpenSans_Condensed-Light",
          "Open Sans Condensed",
          "system-ui",
          "sans-serif",
        ],
        "opensans-condensed-medium": [
          "OpenSans_Condensed-Medium",
          "Open Sans Condensed",
          "system-ui",
          "sans-serif",
        ],
        "opensans-condensed-semibold": [
          "OpenSans_Condensed-SemiBold",
          "Open Sans Condensed",
          "system-ui",
          "sans-serif",
        ],
        "opensans-condensed-bold": [
          "OpenSans_Condensed-Bold",
          "Open Sans Condensed",
          "system-ui",
          "sans-serif",
        ],
        "opensans-condensed-extrabold": [
          "OpenSans_Condensed-ExtraBold",
          "Open Sans Condensed",
          "system-ui",
          "sans-serif",
        ],

        // Open Sans SemiCondensed fonts with web fallbacks
        "opensans-semicondensed": [
          "OpenSans_SemiCondensed-Regular",
          "Open Sans",
          "system-ui",
          "sans-serif",
        ],
        "opensans-semicondensed-light": [
          "OpenSans_SemiCondensed-Light",
          "Open Sans",
          "system-ui",
          "sans-serif",
        ],
        "opensans-semicondensed-medium": [
          "OpenSans_SemiCondensed-Medium",
          "Open Sans",
          "system-ui",
          "sans-serif",
        ],
        "opensans-semicondensed-semibold": [
          "OpenSans_SemiCondensed-SemiBold",
          "Open Sans",
          "system-ui",
          "sans-serif",
        ],
        "opensans-semicondensed-bold": [
          "OpenSans_SemiCondensed-Bold",
          "Open Sans",
          "system-ui",
          "sans-serif",
        ],
        "opensans-semicondensed-extrabold": [
          "OpenSans_SemiCondensed-ExtraBold",
          "Open Sans",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
