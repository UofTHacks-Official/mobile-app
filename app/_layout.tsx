import toastConfig from "@/components/config/toastconfig";
import { AuthProvider } from "@/context/authContext";
import { useCustomFonts } from "@/utils/fonts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "./globals.css";

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

export default function RootLayout() {
  const { fontsLoaded, fontError } = useCustomFonts();
  const notificationResponseListener = useRef<
    Notifications.Subscription | undefined
  >(undefined);

  console.log(
    "RootLayout rendered. fontsLoaded:",
    fontsLoaded,
    "fontError:",
    fontError
  );

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
        console.log("Notification tapped with data:", data);

        // // Check the type of navigation action
        // if (data.type === "event_details" && data.eventId) {
        //   // Use expo-router to navigate to the specific page
        //   // Assuming your event details page is at /events/[eventId]
        //   router.push(`/events/${data.eventId}`);
        // }
        // // Add more conditions for other notification types
        // else if (data.type === "some_other_page") {
        //   router.push("/some/other/page");
        // }
      });

    return () => {
      // Clean up the listener when the component unmounts
      if (notificationResponseListener.current) {
        Notifications.removeNotificationSubscription(
          notificationResponseListener.current
        );
      }
    };
  }, []); // Empty dependency array means this runs once on mount

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
