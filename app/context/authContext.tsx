// AuthContext.tsx
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Admin } from "../requests/admin";
import { getAdminProfile } from "../requests/admin";
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

  // Listen for token changes and update admin data
  useEffect(() => {
    if (userToken) {
      fetchAdminProfile(userToken);
    } else {
      setAdminData(null);
    }
  }, [userToken]);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const tokens = await getAuthTokens();
        console.log("tokens:", tokens);
        if (tokens?.access_token) {
          setUserToken(tokens.access_token);
          // Admin data will be fetched automatically via the useEffect above
          router.replace("/(admin)" as any);
        }
      } catch (error) {
        console.error("Error checking token:", error);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  // Function to fetch admin profile data
  const fetchAdminProfile = async (token: string) => {
    setAdminLoading(true);
    try {
      const result = await getAdminProfile(token);
      if (result.error) {
        console.error("Error fetching admin profile:", result.error);
        // If we get a 401 error, it might mean the token is invalid
        // The axios interceptor will handle token refresh automatically
        return;
      }
      if (result.response) {
        setAdminData(result.response.data as Admin);
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      // Don't clear admin data on network errors, only on auth errors
    } finally {
      setAdminLoading(false);
    }
  };

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

  const signOut = async () => {
    try {
      router.replace("/");
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await removeAuthTokens();
      setUserToken(null);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
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
