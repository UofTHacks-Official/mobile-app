// AuthContext.tsx
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Admin } from "../requests/admin";
import { getAdminProfile } from "../requests/admin";
import { authEventEmitter } from "../utils/eventEmitter";
import {
  getAuthTokens,
  removeAuthTokens,
  storeAuthTokens,
} from "../utils/tokens/secureStorage";

interface AuthContextType {
  userToken: string | null;
  adminData: Admin | null;
  signIn: (access_token: string, refresh_token: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  adminLoading: boolean;
  refreshAdminData: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [adminData, setAdminData] = useState<Admin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);

  console.log(
    "AuthContext: Rendered, loading:",
    loading,
    "userToken:",
    !!userToken
  );

  const signOut = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await removeAuthTokens();
      setUserToken(null);
      console.log("AuthContext: Signed out, userToken set to null");
      // Reset navigation stack to login screen after sign out
      router.replace("/auth/signInAdmin");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  }, []);

  // Listen for auth errors from the axios interceptor
  useEffect(() => {
    const handleAuthError = () => {
      if (userToken) {
        console.log(
          "AuthContext: Authentication error detected, calling signOut."
        );
        signOut();
      }
    };

    authEventEmitter.on("onExpiredRefreshToken", handleAuthError);

    return () => {
      authEventEmitter.off("onExpiredRefreshToken", handleAuthError);
    };
  }, [signOut, userToken]);

  // Restore session on app start
  useEffect(() => {
    const restoreSession = async () => {
      console.log("AuthContext: restoreSession started.");
      try {
        const tokens = await getAuthTokens();
        if (tokens?.access_token) {
          setUserToken(tokens.access_token);
          console.log("AuthContext: Tokens restored, userToken set.");
        } else {
          console.log("AuthContext: No tokens found.");
        }
      } catch (error) {
        console.error("AuthContext: Error restoring session:", error);
      } finally {
        setLoading(false);
        console.log(
          "AuthContext: restoreSession finished, loading set to false."
        );
      }
    };
    restoreSession();
  }, []);

  // Function to fetch admin profile data
  const fetchAdminProfile = useCallback(async (token: string) => {
    if (!token) return; // Prevent fetching if token is null
    setAdminLoading(true);
    try {
      const result = await getAdminProfile(token);
      if (result.error) {
        console.error("Error fetching admin profile:", result.error);
        return;
      }
      if (result.response) {
        setAdminData(result.response.data as Admin);
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
    } finally {
      setAdminLoading(false);
    }
  }, []);

  // Listen for token changes and update admin data
  useEffect(() => {
    console.log("AuthContext: userToken changed, fetching admin profile.");
    if (userToken) {
      fetchAdminProfile(userToken);
    } else {
      setAdminData(null);
    }
  }, [userToken, fetchAdminProfile]);

  // Function to refresh admin data (useful after token refresh)
  const refreshAdminData = async () => {
    if (userToken) {
      await fetchAdminProfile(userToken);
    }
  };

  const signIn = async (access_token: string, refresh_token: string) => {
    setUserToken(access_token);
    await storeAuthTokens(access_token, refresh_token);
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        adminData,
        signIn,
        signOut,
        loading,
        adminLoading,
        refreshAdminData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Default export for Expo Router
export default AuthProvider;
