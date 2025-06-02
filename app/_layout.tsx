import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { AuthProvider } from "./context/authContext";
import "./globals.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "PPObjectSans-Slanted": require("../assets/fonts/PPObjectSans-Slanted.otf"),
    "PPObjectSans-Regular": require("../assets/fonts/PPObjectSans-Regular.otf"),
    "PPObjectSans-Medium": require("../assets/fonts/PPObjectSans-Medium.otf"),
    "PPObjectSans-Heavy": require("../assets/fonts/PPObjectSans-Heavy.otf"),
    "PPObjectSans-Bold": require("../assets/fonts/PPObjectSans-Bold.otf"),
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
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
    </AuthProvider>
  );
}
