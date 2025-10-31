import CustomTabBar from "@/components/bottom/bottomNavBar";
import { AuthContext } from "@/context/authContext";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { Redirect, Tabs } from "expo-router";
import { useContext } from "react";

export default function AdminLayout() {
  const { userToken, loading, isFirstSignIn } = useContext(AuthContext)!;

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // Redirect to home if not authenticated
  if (!userToken && !loading) {
    return <Redirect href="/auth/selectRole" />;
  }

  if (isFirstSignIn && !loading && userToken) {
    return <Redirect href="/auth/notification" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => {
        const filteredProps = {
          ...props,
          state: {
            ...props.state,
            routes: props.state.routes.filter((route) => {
              // Always hide these routes
              if (
                route.name === "profile" ||
                route.name === "hackerbucks" ||
                route.name === "gallery" ||
                route.name.startsWith("schedule-detail")
              ) {
                return false;
              }

              // Hide QR scanner if all scanner features are disabled
              if (
                route.name === "qr" &&
                !FEATURE_FLAGS.ENABLE_QR_SCANNER &&
                !FEATURE_FLAGS.ENABLE_EVENT_CHECKIN &&
                !FEATURE_FLAGS.ENABLE_HACKERBUCKS
              ) {
                return false;
              }

              // Hide photobooth if disabled
              if (
                route.name === "photobooth" &&
                !FEATURE_FLAGS.ENABLE_PHOTOBOOTH
              ) {
                return false;
              }

              return true;
            }),
          },
        };
        return <CustomTabBar {...filteredProps} />;
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
        }}
      />
      <Tabs.Screen
        name="qr"
        options={{
          title: "Scan",
          // Hide tab if both QR scanner features are disabled
          href:
            FEATURE_FLAGS.ENABLE_QR_SCANNER ||
            FEATURE_FLAGS.ENABLE_EVENT_CHECKIN ||
            FEATURE_FLAGS.ENABLE_HACKERBUCKS
              ? undefined
              : null,
        }}
      />
      <Tabs.Screen
        name="photobooth"
        options={{
          title: "Photo",
          // Hide tab if photobooth is disabled
          href: FEATURE_FLAGS.ENABLE_PHOTOBOOTH ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          href: null, // Hide from tabs
        }}
      />
    </Tabs>
  );
}
