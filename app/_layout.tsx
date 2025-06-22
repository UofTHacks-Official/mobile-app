import { Stack } from "expo-router";
import React from "react";
import Toast from "react-native-toast-message";
import toastConfig from "./components/config/toastconfig";
import { AuthProvider } from "./context/authContext";
import "./globals.css";
import { useCustomFonts } from "./utils/fonts";

export default function RootLayout() {
  const { fontsLoaded, fontError } = useCustomFonts();

  // Handle font loading errors
  if (fontError) {
    console.error("Font loading error:", fontError);
  }

  // You can show a loading screen while fonts are loading
  if (!fontsLoaded) {
    // You might want to show a splash screen here
    return null; // or a loading component
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{ headerShown: false, animation: "none" }}
        />
        <Stack.Screen name="auth/selectRole" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/signInAdmin"
          options={{ headerShown: false, animation: "none" }}
        />
        <Stack.Screen
          name="admin"
          options={{ headerShown: false, animation: "none" }}
        />
      </Stack>
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}
