import { router, Stack, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { useHackerBucksStore } from "../../reducers/hackerbucks";

export default function HackerBucksLayout() {
  const segments = useSegments();
  const { currentTransaction } = useHackerBucksStore();

  useEffect(() => {
    if (segments[segments.length - 1] === "success" && !currentTransaction) {
      router.replace("/(admin)/hackerbucks");
    }
  }, [segments, currentTransaction]);

  return <Stack screenOptions={{ headerShown: false }}></Stack>;
}
