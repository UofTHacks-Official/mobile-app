import { JudgeTimerSocketListener } from "@/components/judging/JudgeTimerSocketListener";
import { AuthContext } from "@/context/authContext";
import { TimerProvider } from "@/context/timerContext";
import { Redirect, Stack } from "expo-router";
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
      <JudgeTimerSocketListener />
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
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="scorecard"
          options={{
            headerShown: false,
            animation: "slide_from_right",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="complete"
          options={{
            headerShown: false,
            animation: "fade",
            gestureEnabled: false,
          }}
        />
      </Stack>
    </TimerProvider>
  );
}
