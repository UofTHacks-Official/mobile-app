import toastConfig from "@/components/config/toastconfig";
import { AuthProvider } from "@/context/authContext";
import { ThemeProvider } from "@/context/themeContext";
import { useCustomFonts } from "@/utils/fonts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";

import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "./globals.css";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: true,
  }),
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const { fontsLoaded, fontError } = useCustomFonts();
  const notificationResponseListener = useRef<
    Notifications.EventSubscription | undefined
  >(undefined);
  const notificationReceivedListener = useRef<
    Notifications.EventSubscription | undefined
  >(undefined);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // This listener is fired whenever a user taps on or interacts with a
    // notification (works when app is foregrounded, backgrounded, or killed)
    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { data } = response.notification.request.content;
        // Type assertion to define the expected data structure
        const notificationData = data as { data?: { route?: string } };

        if (notificationData.data?.route === "schedule") {
          router.push(`/(admin)/schedule`);
        }
      });

    // Only set up foreground listener if you want to show custom UI when app is open
    // This should only fire when the app is actually in the foreground=
    notificationReceivedListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // Only show toast if the app is actually in foreground
        Toast.show({
          type: "info",
          text1: notification.request.content.title || "New Notification",
          text2: notification.request.content.body || "",
        });
      });

    return () => {
      // Clean up the listener when the component unmounts
      if (notificationResponseListener.current) {
        notificationResponseListener.current.remove();
      }
      if (notificationReceivedListener.current) {
        notificationReceivedListener.current.remove();
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name="auth/selectRole"
                options={{ headerShown: false, animation: "fade" }}
              />
              <Stack.Screen
                name="auth/signInAdmin"
                options={{ headerShown: false, animation: "slide_from_right" }}
              />
              <Stack.Screen
                name="auth/camera"
                options={{ headerShown: false, animation: "slide_from_right" }}
              />
              <Stack.Screen
                name="auth/notification"
                options={{ headerShown: false, animation: "slide_from_right" }}
              />
              <Stack.Screen
                name="(admin)"
                options={{
                  headerShown: false,
                  animation: "fade",
                  gestureEnabled: false,
                }}
              />

            </Stack>

            <Toast config={toastConfig} />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
