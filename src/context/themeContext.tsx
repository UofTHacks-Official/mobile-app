import { getSecureToken, setSecureToken } from "@/utils/tokens/secureStorage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  colorScheme: "light" | "dark" | null;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>("system");

  // Determine the actual color scheme based on theme preference
  const colorScheme =
    theme === "system" ? (systemColorScheme as "light" | "dark" | null) : theme;
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const loadThemePreference = async () => {
      const savedTheme = await getSecureToken("theme_preference");
      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        setTheme(savedTheme as Theme);
      }
    };
    loadThemePreference();
  }, []);

  const handleSetTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    await setSecureToken("theme_preference", newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorScheme,
        setTheme: handleSetTheme,
        isDark,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      {children}
    </ThemeContext.Provider>
  );
};
