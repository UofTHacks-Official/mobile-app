import { Stack } from "expo-router";

//import { useHackerBucksStore } from "@/reducers/hackerbucks";

export default function HackerBucksLayout() {
  //const { currentTransaction } = useHackerBucksStore();

  // useEffect(() => {
  //   if (segments[segments.length - 1] === "success" && !currentTransaction) {
  //     router.replace("/(admin)/hackerbucks");
  //   }
  // }, [segments, currentTransaction]);

  return <Stack screenOptions={{ headerShown: false }}></Stack>;
}
