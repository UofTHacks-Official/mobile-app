import { Redirect, Tabs } from "expo-router";
import { useContext } from "react";
import CustomTabBar from "../components/bottom/bottomNavBar";
import { AuthContext } from "../context/authContext";

export default function AdminLayout() {
  const { userToken, loading } = useContext(AuthContext);

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
      tabBar={(props) => <CustomTabBar {...props} />}
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
        name="hackerbucks"
        options={{
          title: "Send",
        }}
      />
      {/* <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      /> */}
    </Tabs>
  );
}
