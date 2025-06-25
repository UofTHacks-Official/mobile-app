import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import toastConfig from "./components/config/toastconfig";
import { AuthProvider } from "./context/authContext";
import "./globals.css";
import { useCustomFonts } from "./utils/fonts";

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="index"
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
            name="admin"
            options={{ headerShown: false, animation: "none" }}
          />
        </Stack>
        <Toast config={toastConfig} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
