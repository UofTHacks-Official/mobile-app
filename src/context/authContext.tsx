// AuthContext.tsx
import type { Admin } from "@/requests/admin";
import { getAdminProfile } from "@/requests/admin";
import type { Hacker } from "@/requests/hacker";
import { getHackerProfile } from "@/requests/hacker";
import { useUserTypeStore } from "@/reducers/userType";
import { authEventEmitter } from "@/utils/eventEmitter";
import { devError } from "@/utils/logger";
import {
  getAuthTokens,
  removeAuthTokens,
  storeAuthTokens,
} from "@/utils/tokens/secureStorage";
import * as Haptics from "expo-haptics";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface AuthContextType {
  userToken: string | null;
  adminData: Admin | null;
  hackerData: Hacker | null;
  signIn: (access_token: string, refresh_token: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  profileLoading: boolean;
  isFirstSignIn: boolean;
  refreshUserData: () => Promise<void>;
  updateFirstSignInStatus: (status: boolean) => void;
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
  const [hackerData, setHackerData] = useState<Hacker | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [isFirstSignIn, setIsFirstSignIn] = useState<boolean>(false);
  const fetchIdRef = useRef(0);
  const { userType } = useUserTypeStore();

  const updateFirstSignInStatus = useCallback((status: boolean) => {
    setIsFirstSignIn(status);
  }, []);

  const signOut = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await removeAuthTokens();
      setUserToken(null);
      setIsFirstSignIn(false);
      setAdminData(null);
      setHackerData(null);
    } catch (error) {
      devError("Error during sign out:", error);
    }
  }, []);

  // Listen for auth errors from the axios interceptor
  useEffect(() => {
    const handleAuthError = () => {
      if (userToken) {
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
      try {
        const tokens = await getAuthTokens();
        if (tokens?.access_token) {
          setUserToken(tokens.access_token);
          // isFirstSignIn will be set when admin profile is fetched
        }
      } catch (error) {
        devError("AuthContext: Error restoring session:", error);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Function to fetch user profile data (admin or hacker based on userType)
  const fetchUserProfile = useCallback(
    async (token: string, fetchId: number) => {
      if (!token) return;
      setProfileLoading(true);
      try {
        // Fetch profile based on user type
        if (userType === "hacker") {
          const result = await getHackerProfile(token);
          if (result.error) {
            devError(
              "Error fetching hacker profile:",
              result.error,
              result.response
            );
            await signOut();
            return;
          }
          if (result.response) {
            if (fetchIdRef.current === fetchId) {
              const hackerProfile = result.response.data as Hacker;
              setHackerData(hackerProfile);
              // For hackers, always set isFirstSignIn to true initially
              // You can adjust this logic based on your hacker data structure
              setIsFirstSignIn(true);
            }
          }
        } else {
          // Default to admin profile for admin, volunteer, etc.
          const result = await getAdminProfile(token);
          if (result.error) {
            devError(
              "Error fetching admin profile:",
              result.error,
              result.response
            );
            await signOut();
            return;
          }
          if (result.response) {
            if (fetchIdRef.current === fetchId) {
              const adminProfile = result.response.data as Admin;
              setAdminData(adminProfile);
              // Set isFirstSignIn based on last_login field
              setIsFirstSignIn(!adminProfile.last_login);
            }
          }
        }
      } catch (error) {
        devError("Error fetching user profile:", error);
        await signOut();
      } finally {
        if (fetchIdRef.current === fetchId) {
          setProfileLoading(false);
        }
      }
    },
    [signOut, userType]
  );

  // Listen for token changes and update user data
  useEffect(() => {
    if (userToken) {
      fetchIdRef.current += 1;
      const currentFetchId = fetchIdRef.current;
      fetchUserProfile(userToken, currentFetchId);
    }
  }, [userToken, fetchUserProfile]);

  // Function to refresh user data (useful after token refresh)
  const refreshUserData = async () => {
    fetchIdRef.current += 1;
    const currentFetchId = fetchIdRef.current;
    if (userToken) {
      await fetchUserProfile(userToken, currentFetchId);
    }
  };

  const signIn = async (access_token: string, refresh_token: string) => {
    setUserToken(access_token);
    await storeAuthTokens(access_token, refresh_token);
    // isFirstSignIn will be set when user profile is fetched
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        adminData,
        hackerData,
        signIn,
        signOut,
        loading,
        profileLoading,
        isFirstSignIn,
        refreshUserData,
        updateFirstSignInStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Default export for Expo Router
export default AuthProvider;
