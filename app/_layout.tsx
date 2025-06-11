import { Stack } from "expo-router";
import { AuthProvider } from "./context/authContext";
import "./globals.css";

export default function RootLayout() {
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
    </AuthProvider>
  );
}
