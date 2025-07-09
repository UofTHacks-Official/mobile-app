import { Redirect } from "expo-router";
import { useAuth } from "@/context/authContext";

export default function StartPage() {
  const { userToken, loading } = useAuth();

  // Show a loading screen while authentication state is being determined
  if (loading) {
    return null; // Or a splash screen component
  }

  // Redirect based on authentication state
  if (userToken) {
    return <Redirect href="/(admin)" />;
  } else {
    return <Redirect href="/auth/selectRole" />;
  }
}
