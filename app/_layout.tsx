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
import { devLog } from "@/utils/logger";
import { usePhotoboothNotificationStore } from "@/reducers/photoboothNotification";

type ScheduleNotificationData = {
  route?: string;
  scheduleId?: string;
};

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
  const { setNotificationBody } = usePhotoboothNotificationStore();
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
    // This listener is fired whenever a user taps on or interacts with push notification
    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { data } = response.notification.request.content;
        const notificationData = data as ScheduleNotificationData;

        devLog(
          `[Notification Tap]: route=${notificationData.route}, scheduleId=${notificationData.scheduleId}`
        );

        if (notificationData.route === "schedule") {
          const scheduleId = notificationData.scheduleId;
          if (scheduleId) {
            router.push(`/schedule-detail/${scheduleId}`);
          } else {
            router.push(`/(admin)/schedule`);
          }
        }
      });

    notificationReceivedListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const { data, title, body } = notification.request.content;
        const notificationData = data as ScheduleNotificationData;

        devLog(
          `[Notification Received]: ${notification.request.content.title}`
        );

        // Check if the notification title is "photobooth"
        if (title?.toLowerCase() === "photobooth") {
          devLog(`[Photobooth Notification]: Captured body: ${body}`);
          if (body) {
            setNotificationBody(body);
          }
        }

        Toast.show({
          type: "info",
          text1: notification.request.content.title || "New Notification",
          text2: notification.request.content.body || "",
          onPress: () => {
            if (notificationData.route === "schedule") {
              const scheduleId = notificationData.scheduleId;
              if (scheduleId) {
                router.push(`/schedule-detail/${scheduleId}`);
              } else {
                router.push(`/(admin)/schedule`);
              }
            }
            Toast.hide();
          },
        });
      });

    return () => {
      if (notificationResponseListener.current) {
        notificationResponseListener.current.remove();
      }
      if (notificationReceivedListener.current) {
        notificationReceivedListener.current.remove();
      }
    };
  }, [setNotificationBody]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name="landing"
                options={{ headerShown: false, animation: "fade" }}
              />
              <Stack.Screen
                name="auth/selectRole"
                options={{ headerShown: false, animation: "slide_from_right" }}
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

              <Stack.Screen
                name="(judge)"
                options={{
                  headerShown: false,
                  animation: "fade",
                  gestureEnabled: false,
                }}
              />

              <Stack.Screen
                name="schedule-detail/[scheduleID]"
                options={{
                  headerShown: false,
                  presentation: "modal",
                  gestureEnabled: true,
                  gestureDirection: "vertical",
                  animationTypeForReplace: "push",
                }}
              />

              <Stack.Screen
                name="profile/[id]"
                options={{
                  headerShown: false,
                  presentation: "modal",
                  gestureEnabled: true,
                  gestureDirection: "vertical",
                  animationTypeForReplace: "push",
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
