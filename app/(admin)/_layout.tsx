import { Redirect, Tabs } from "expo-router";
import { useContext } from "react";
import CustomTabBar from "../components/bottom/bottomNavBar";
import { AuthContext } from "../context/authContext";

export default function AdminLayout() {
  const { userToken, loading } = useContext(AuthContext)!;

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // Redirect to home if not authenticated
  if (!userToken) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => {
        // Filter out the profile and hackerbucks screens from the tab bar props
        const filteredProps = {
          ...props,
          state: {
            ...props.state,
            routes: props.state.routes.filter(
              (route) =>
                route.name !== "profile" && route.name !== "hackerbucks"
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
      {/* <Tabs.Screen
        name="hackerbucks"
        options={{
          title: "Send",
          href: null, // This prevents it from showing in the tab bar
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          href: null, // This prevents it from showing in the tab bar
        }}
      /> */}
    </Tabs>
  );
}
