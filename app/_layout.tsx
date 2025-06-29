import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import toastConfig from "./components/config/toastconfig";
import { AuthProvider } from "./context/authContext";
import "./globals.css";
import { useCustomFonts } from "./_utils/fonts";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (failureCount >= 3) return false;
        if (error instanceof Error && error.message.includes("404")) {
          return false;
        }
        return true;
      },
    },
  },
});

const queryClient = new QueryClient();

export default function RootLayout() {
  const { fontsLoaded, fontError } = useCustomFonts();

  console.log("RootLayout rendered. fontsLoaded:", fontsLoaded, "fontError:", fontError);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Handle font loading errors
  if (fontError) {
    console.error("Font loading error:", fontError);
  }

  // We don't return null here anymore, as SplashScreen handles the loading state.
  // The UI will be rendered once fonts are loaded.

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="_redirect"
              options={{ headerShown: false, animation: "none" }}
            />
            <Stack.Screen
              name="auth/selectRole"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="auth/signInAdmin"
              options={{ headerShown: false, animation: "none" }}
            />
            <Stack.Screen
              name="(admin)"
              options={{ headerShown: false, animation: "none" }}
            />
          </Stack>
          <Toast config={toastConfig} />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
