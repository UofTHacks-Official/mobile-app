import { Stack } from "expo-router";
import React from "react";
import Toast from "react-native-toast-message";
import toastConfig from "./components/config/toastconfig";
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
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}
