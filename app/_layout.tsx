import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from "expo-router";
import { AuthProvider } from "./context/authContext";
import "./globals.css";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
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
      </AuthProvider>
    </QueryClientProvider>
  );
}
