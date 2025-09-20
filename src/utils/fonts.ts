import { useFonts } from "expo-font";

// Font family constants
export const FONTS = {
  // Onest fonts (static)
  ONEST_THIN: "Onest-Thin",
  ONEST_EXTRALIGHT: "Onest-ExtraLight",
  ONEST_LIGHT: "Onest-Light",
  ONEST_REGULAR: "Onest-Regular",
  ONEST_MEDIUM: "Onest-Medium",
  ONEST_SEMIBOLD: "Onest-SemiBold",
  ONEST_BOLD: "Onest-Bold",
  ONEST_EXTRABOLD: "Onest-ExtraBold",
  ONEST_BLACK: "Onest-Black",

  // Open Sans fonts (static)
  OPENSANS_LIGHT: "OpenSans-Light",
  OPENSANS_REGULAR: "OpenSans-Regular",
  OPENSANS_MEDIUM: "OpenSans-Medium",
  OPENSANS_SEMIBOLD: "OpenSans-SemiBold",
  OPENSANS_BOLD: "OpenSans-Bold",
  OPENSANS_EXTRABOLD: "OpenSans-ExtraBold",

  // Open Sans Condensed fonts
  OPENSANS_CONDENSED_LIGHT: "OpenSans_Condensed-Light",
  OPENSANS_CONDENSED_REGULAR: "OpenSans_Condensed-Regular",
  OPENSANS_CONDENSED_MEDIUM: "OpenSans_Condensed-Medium",
  OPENSANS_CONDENSED_SEMIBOLD: "OpenSans_Condensed-SemiBold",
  OPENSANS_CONDENSED_BOLD: "OpenSans_Condensed-Bold",
  OPENSANS_CONDENSED_EXTRABOLD: "OpenSans_Condensed-ExtraBold",

  // Open Sans SemiCondensed fonts
  OPENSANS_SEMICONDENSED_LIGHT: "OpenSans_SemiCondensed-Light",
  OPENSANS_SEMICONDENSED_REGULAR: "OpenSans_SemiCondensed-Regular",
  OPENSANS_SEMICONDENSED_MEDIUM: "OpenSans_SemiCondensed-Medium",
  OPENSANS_SEMICONDENSED_SEMIBOLD: "OpenSans_SemiCondensed-SemiBold",
  OPENSANS_SEMICONDENSED_BOLD: "OpenSans_SemiCondensed-Bold",
  OPENSANS_SEMICONDENSED_EXTRABOLD: "OpenSans_SemiCondensed-ExtraBold",

  // Variable fonts
  OPENSANS_VARIABLE: "OpenSans-Variable",
  OPENSANS_ITALIC_VARIABLE: "OpenSans-Italic-Variable",
} as const;

// Font weight mappings for variable fonts
export const FONT_WEIGHTS = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

// Type definitions for font weights
export type OnestFontWeight =
  | "thin"
  | "extralight"
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black";
export type OpenSansFontWeight =
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold";
export type OpenSansCondensedFontWeight =
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold";
export type OpenSansSemiCondensedFontWeight =
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold";

// Hook to load all fonts
export function useCustomFonts() {
  const [fontsLoaded, fontError] = useFonts({
    // Onest static fonts
    [FONTS.ONEST_THIN]: require("../../assets/fonts/Onest-Thin.ttf"),
    [FONTS.ONEST_EXTRALIGHT]: require("../../assets/fonts/Onest-ExtraLight.ttf"),
    [FONTS.ONEST_LIGHT]: require("../../assets/fonts/Onest-Light.ttf"),
    [FONTS.ONEST_REGULAR]: require("../../assets/fonts/Onest-Regular.ttf"),
    [FONTS.ONEST_MEDIUM]: require("../../assets/fonts/Onest-Medium.ttf"),
    [FONTS.ONEST_SEMIBOLD]: require("../../assets/fonts/Onest-SemiBold.ttf"),
    [FONTS.ONEST_BOLD]: require("../../assets/fonts/Onest-Bold.ttf"),
    [FONTS.ONEST_EXTRABOLD]: require("../../assets/fonts/Onest-ExtraBold.ttf"),
    [FONTS.ONEST_BLACK]: require("../../assets/fonts/Onest-Black.ttf"),

    // Open Sans static fonts
    [FONTS.OPENSANS_LIGHT]: require("../../assets/fonts/OpenSans-Light.ttf"),
    [FONTS.OPENSANS_REGULAR]: require("../../assets/fonts/OpenSans-Regular.ttf"),
    [FONTS.OPENSANS_MEDIUM]: require("../../assets/fonts/OpenSans-Medium.ttf"),
    [FONTS.OPENSANS_SEMIBOLD]: require("../../assets/fonts/OpenSans-SemiBold.ttf"),
    [FONTS.OPENSANS_BOLD]: require("../../assets/fonts/OpenSans-Bold.ttf"),
    [FONTS.OPENSANS_EXTRABOLD]: require("../../assets/fonts/OpenSans-ExtraBold.ttf"),

    // Open Sans Condensed fonts
    [FONTS.OPENSANS_CONDENSED_LIGHT]: require("../../assets/fonts/OpenSans_Condensed-Light.ttf"),
    [FONTS.OPENSANS_CONDENSED_REGULAR]: require("../../assets/fonts/OpenSans_Condensed-Regular.ttf"),
    [FONTS.OPENSANS_CONDENSED_MEDIUM]: require("../../assets/fonts/OpenSans_Condensed-Medium.ttf"),
    [FONTS.OPENSANS_CONDENSED_SEMIBOLD]: require("../../assets/fonts/OpenSans_Condensed-SemiBold.ttf"),
    [FONTS.OPENSANS_CONDENSED_BOLD]: require("../../assets/fonts/OpenSans_Condensed-Bold.ttf"),
    [FONTS.OPENSANS_CONDENSED_EXTRABOLD]: require("../../assets/fonts/OpenSans_Condensed-ExtraBold.ttf"),

    // Open Sans SemiCondensed fonts
    [FONTS.OPENSANS_SEMICONDENSED_LIGHT]: require("../../assets/fonts/OpenSans_SemiCondensed-Light.ttf"),
    [FONTS.OPENSANS_SEMICONDENSED_REGULAR]: require("../../assets/fonts/OpenSans_SemiCondensed-Regular.ttf"),
    [FONTS.OPENSANS_SEMICONDENSED_MEDIUM]: require("../../assets/fonts/OpenSans_SemiCondensed-Medium.ttf"),
    [FONTS.OPENSANS_SEMICONDENSED_SEMIBOLD]: require("../../assets/fonts/OpenSans_SemiCondensed-SemiBold.ttf"),
    [FONTS.OPENSANS_SEMICONDENSED_BOLD]: require("../../assets/fonts/OpenSans_SemiCondensed-Bold.ttf"),
    [FONTS.OPENSANS_SEMICONDENSED_EXTRABOLD]: require("../../assets/fonts/OpenSans_SemiCondensed-ExtraBold.ttf"),

    // Open Sans variable fonts
    [FONTS.OPENSANS_VARIABLE]: require("../../assets/fonts/OpenSans-VariableFont_wdth,wght.ttf"),
    [FONTS.OPENSANS_ITALIC_VARIABLE]: require("../../assets/fonts/OpenSans-Italic-VariableFont_wdth,wght.ttf"),
  });

  return { fontsLoaded, fontError };
}

// Utility functions for font usage
export const getOnestFont = (weight: OnestFontWeight = "regular") => {
  const fontMap = {
    thin: FONTS.ONEST_THIN,
    extralight: FONTS.ONEST_EXTRALIGHT,
    light: FONTS.ONEST_LIGHT,
    regular: FONTS.ONEST_REGULAR,
    medium: FONTS.ONEST_MEDIUM,
    semibold: FONTS.ONEST_SEMIBOLD,
    bold: FONTS.ONEST_BOLD,
    extrabold: FONTS.ONEST_EXTRABOLD,
    black: FONTS.ONEST_BLACK,
  };
  return fontMap[weight];
};

export const getOpenSansFont = (weight: OpenSansFontWeight = "regular") => {
  const fontMap = {
    light: FONTS.OPENSANS_LIGHT,
    regular: FONTS.OPENSANS_REGULAR,
    medium: FONTS.OPENSANS_MEDIUM,
    semibold: FONTS.OPENSANS_SEMIBOLD,
    bold: FONTS.OPENSANS_BOLD,
    extrabold: FONTS.OPENSANS_EXTRABOLD,
  };
  return fontMap[weight];
};

export const getOpenSansCondensedFont = (
  weight: OpenSansCondensedFontWeight = "regular"
) => {
  const fontMap = {
    light: FONTS.OPENSANS_CONDENSED_LIGHT,
    regular: FONTS.OPENSANS_CONDENSED_REGULAR,
    medium: FONTS.OPENSANS_CONDENSED_MEDIUM,
    semibold: FONTS.OPENSANS_CONDENSED_SEMIBOLD,
    bold: FONTS.OPENSANS_CONDENSED_BOLD,
    extrabold: FONTS.OPENSANS_CONDENSED_EXTRABOLD,
  };
  return fontMap[weight];
};

export const getOpenSansSemiCondensedFont = (
  weight: OpenSansSemiCondensedFontWeight = "regular"
) => {
  const fontMap = {
    light: FONTS.OPENSANS_SEMICONDENSED_LIGHT,
    regular: FONTS.OPENSANS_SEMICONDENSED_REGULAR,
    medium: FONTS.OPENSANS_SEMICONDENSED_MEDIUM,
    semibold: FONTS.OPENSANS_SEMICONDENSED_SEMIBOLD,
    bold: FONTS.OPENSANS_SEMICONDENSED_BOLD,
    extrabold: FONTS.OPENSANS_SEMICONDENSED_EXTRABOLD,
  };
  return fontMap[weight];
};

// Style objects for common font combinations
export const FONT_STYLES = {
  // Onest styles
  onest: {
    thin: { fontFamily: FONTS.ONEST_THIN },
    extralight: { fontFamily: FONTS.ONEST_EXTRALIGHT },
    light: { fontFamily: FONTS.ONEST_LIGHT },
    regular: { fontFamily: FONTS.ONEST_REGULAR },
    medium: { fontFamily: FONTS.ONEST_MEDIUM },
    semibold: { fontFamily: FONTS.ONEST_SEMIBOLD },
    bold: { fontFamily: FONTS.ONEST_BOLD },
    extrabold: { fontFamily: FONTS.ONEST_EXTRABOLD },
    black: { fontFamily: FONTS.ONEST_BLACK },
  },

  // Open Sans styles
  opensans: {
    light: { fontFamily: FONTS.OPENSANS_LIGHT },
    regular: { fontFamily: FONTS.OPENSANS_REGULAR },
    medium: { fontFamily: FONTS.OPENSANS_MEDIUM },
    semibold: { fontFamily: FONTS.OPENSANS_SEMIBOLD },
    bold: { fontFamily: FONTS.OPENSANS_BOLD },
    extrabold: { fontFamily: FONTS.OPENSANS_EXTRABOLD },
  },

  // Open Sans Condensed styles
  opensansCondensed: {
    light: { fontFamily: FONTS.OPENSANS_CONDENSED_LIGHT },
    regular: { fontFamily: FONTS.OPENSANS_CONDENSED_REGULAR },
    medium: { fontFamily: FONTS.OPENSANS_CONDENSED_MEDIUM },
    semibold: { fontFamily: FONTS.OPENSANS_CONDENSED_SEMIBOLD },
    bold: { fontFamily: FONTS.OPENSANS_CONDENSED_BOLD },
    extrabold: { fontFamily: FONTS.OPENSANS_CONDENSED_EXTRABOLD },
  },

  // Open Sans SemiCondensed styles
  opensansSemiCondensed: {
    light: { fontFamily: FONTS.OPENSANS_SEMICONDENSED_LIGHT },
    regular: { fontFamily: FONTS.OPENSANS_SEMICONDENSED_REGULAR },
    medium: { fontFamily: FONTS.OPENSANS_SEMICONDENSED_MEDIUM },
    semibold: { fontFamily: FONTS.OPENSANS_SEMICONDENSED_SEMIBOLD },
    bold: { fontFamily: FONTS.OPENSANS_SEMICONDENSED_BOLD },
    extrabold: { fontFamily: FONTS.OPENSANS_SEMICONDENSED_EXTRABOLD },
  },
} as const;

// Type definitions
export type FontWeight = keyof typeof FONT_WEIGHTS;
export type FontFamily = (typeof FONTS)[keyof typeof FONTS];
