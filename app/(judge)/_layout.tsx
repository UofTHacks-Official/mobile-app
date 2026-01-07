import { AuthContext } from "@/context/authContext";
import { TimerProvider } from "@/context/timerContext";
import { Stack, Redirect } from "expo-router";
import { useContext } from "react";

export default function JudgeLayout() {
  const { userToken, loading } = useContext(AuthContext)!;

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // Redirect to home if not authenticated
  if (!userToken && !loading) {
    return <Redirect href="/auth/selectRole" />;
  }

  return (
    <TimerProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="projectOverview"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="scorecard"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </TimerProvider>
  );
}
