import CustomTabBar from "@/components/bottom/bottomNavBar";
import { AuthContext } from "@/context/authContext";
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
            routes: props.state.routes.filter(
              (route) =>
                route.name !== "profile" &&
                route.name !== "hackerbucks" &&
                !route.name.startsWith("schedule-detail")
            ),
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
        }}
      />
      <Tabs.Screen
        name="photobooth"
        options={{
          title: "Photo",
        }}
      />
    </Tabs>
  );
}
