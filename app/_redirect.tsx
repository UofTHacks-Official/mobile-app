import { Redirect } from "expo-router";
import { useAuth } from "./context/authContext";

export default function StartPage() {
  const { userToken, loading } = useAuth();

  console.log(
    "_redirect: Rendered, loading:",
    loading,
    "userToken:",
    !!userToken
  );

  // Show a loading screen while authentication state is being determined
  if (loading) {
    console.log("_redirect: Still loading, returning null.");
    return null; // Or a splash screen component
  }

  // Redirect based on authentication state
  if (userToken) {
    console.log(
      "_redirect: User authenticated, redirecting to /admin. (via <Redirect>)"
    );
    return <Redirect href="/admin" />;
  } else {
    console.log(
      "_redirect: User not authenticated, redirecting to /auth/signInAdmin. (via <Redirect>)"
    );
    return <Redirect href="/auth/signInAdmin" />;
  }
}
