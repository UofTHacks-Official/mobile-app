import CustomTabBar from "@/components/bottom/bottomNavBar";
import { Sidebar } from "@/components/navigation/Sidebar";
import { AuthContext } from "@/context/authContext";
import { TimerProvider } from "@/context/timerContext";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { getUserType } from "@/utils/tokens/secureStorage";
import { Redirect, Tabs } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Platform, View } from "react-native";

export default function AdminLayout() {
  const { userToken, loading, isFirstSignIn } = useContext(AuthContext)!;
  const [isJudge, setIsJudge] = useState(false);
  const [isHacker, setIsHacker] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);

  useEffect(() => {
    const checkUserType = async () => {
      const userType = await getUserType();
      setIsJudge(userType === "judge");
      setIsHacker(userType === "hacker");
      setIsVolunteer(userType === "volunteer");
    };
    checkUserType();
  }, []);

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // Redirect to home if not authenticated
  if (!userToken && !loading) {
    return <Redirect href="/auth/selectRole" />;
  }

  if (isFirstSignIn && !loading && userToken) {
    return <Redirect href="/auth/onboarding" />;
  }

  // Use sidebar layout for judges on web
  const isWebJudge = Platform.OS === "web" && isJudge;

  const tabsContent = (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => {
        // Hide tab bar on web for judges (they use sidebar instead)
        if (isWebJudge) {
          return null;
        }

        const filteredRoutes = props.state.routes.filter((route) => {
          // Always hide these routes
          if (
            route.name === "gallery" ||
            route.name === "judgeSchedule" ||
            route.name === "judgingTimer" ||
            route.name === "timesUp" ||
            route.name === "test-qr" ||
            route.name.startsWith("schedule-detail")
          ) {
            return false;
          }

          // Always hide hackerbucks from nav bar
          if (route.name === "hackerbucks") {
            return false;
          }

          // Hide schedule for judges and volunteers
          if (route.name === "schedule" && (isJudge || isVolunteer)) {
            return false;
          }

          // Hide judging for hackers and volunteers
          if (route.name === "judging" && (isHacker || isVolunteer)) {
            return false;
          }

          // Hide QR scanner if all scanner features are disabled OR if user is a judge
          if (
            route.name === "qr" &&
            ((!FEATURE_FLAGS.ENABLE_QR_SCANNER &&
              !FEATURE_FLAGS.ENABLE_EVENT_CHECKIN &&
              !FEATURE_FLAGS.ENABLE_HACKERBUCKS) ||
              isJudge)
          ) {
            return false;
          }

          // Hide photobooth if disabled
          if (route.name === "photobooth" && !FEATURE_FLAGS.ENABLE_PHOTOBOOTH) {
            return false;
          }

          // Hide profiles for hackers and volunteers (only show for judges)
          if (route.name === "profiles" && (isHacker || isVolunteer)) {
            return false;
          }

          return true;
        });

        // Find the new index in the filtered array
        const currentRoute = props.state.routes[props.state.index];
        const newIndex = filteredRoutes.findIndex(
          (route) => route.key === currentRoute?.key
        );

        const filteredProps = {
          ...props,
          state: {
            ...props.state,
            routes: filteredRoutes,
            index: newIndex >= 0 ? newIndex : 0,
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
        name="judging"
        options={{
          title: "Judging",
          // Hide tab if judging is disabled
          href: FEATURE_FLAGS.ENABLE_JUDGING ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profiles"
        options={{
          title: "Hackers",
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
        name="profile"
        options={{
          title: "Profile",
        }}
      />
      <Tabs.Screen
        name="test-qr"
        options={{
          href: null, // Hide test QR generator from tabs/nav
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          href: null, // Hide from tabs
        }}
      />
      <Tabs.Screen
        name="judgingTimer"
        options={{
          href: null, // Hide from tabs
        }}
      />
      <Tabs.Screen
        name="hackerbucks"
        options={{
          href: null, // Always hide from tabs
        }}
      />
      <Tabs.Screen
        name="judgeSchedule"
        options={{
          href: null, // Hide from tabs
        }}
      />
      <Tabs.Screen
        name="timesUp"
        options={{
          href: null, // Hide from tabs
        }}
      />
    </Tabs>
  );

  return (
    <TimerProvider>
      {isWebJudge ? (
        <View style={{ flexDirection: "row", flex: 1 }}>
          <Sidebar />
          <View style={{ flex: 1 }}>{tabsContent}</View>
        </View>
      ) : (
        tabsContent
      )}
    </TimerProvider>
  );
}
