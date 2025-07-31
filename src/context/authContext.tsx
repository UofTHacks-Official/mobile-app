// AuthContext.tsx
import type { Admin } from "@/requests/admin";
import { getAdminProfile } from "@/requests/admin";
import { authEventEmitter } from "@/utils/eventEmitter";
import { devError } from "@/utils/logger";
import {
  FIRST_SIGN_SIGN_IN,
  getAuthTokens,
  getSecureToken,
  removeAuthTokens,
  removeSecureToken,
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
  signIn: (access_token: string, refresh_token: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  adminLoading: boolean;
  isFirstSignIn: boolean;
  refreshAdminData: () => Promise<void>;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [isFirstSignIn, setIsFirstSignIn] = useState<boolean>(false);
  const fetchIdRef = useRef(0);

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
      await removeSecureToken(FIRST_SIGN_SIGN_IN);
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
          const firstSignInValue = await getSecureToken(FIRST_SIGN_SIGN_IN);
          setIsFirstSignIn(firstSignInValue === null);
        }
      } catch (error) {
        devError("AuthContext: Error restoring session:", error);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Function to fetch admin profile data
  const fetchAdminProfile = useCallback(
    async (token: string, fetchId: number) => {
      if (!token) return;
      setAdminLoading(true);
      try {
        const result = await getAdminProfile(token);
        if (result.error) {
          devError(
            "Error fetching admin profile:",
            result.error,
            result.response
          );
          return;
        }
        if (result.response) {
          if (fetchIdRef.current === fetchId) {
            setAdminData(result.response.data as Admin);
          }
        }
      } catch (error) {
        devError("Error fetching admin profile:", error);
      } finally {
        if (fetchIdRef.current === fetchId) {
          setAdminLoading(false);
        }
      }
    },
    []
  );

  // Listen for token changes and update admin data
  useEffect(() => {
    if (userToken) {
      fetchIdRef.current += 1;
      const currentFetchId = fetchIdRef.current;
      fetchAdminProfile(userToken, currentFetchId);
    }
  }, [userToken, fetchAdminProfile]);

  // Function to refresh admin data (useful after token refresh)
  const refreshAdminData = async () => {
    fetchIdRef.current += 1;
    const currentFetchId = fetchIdRef.current;
    if (userToken) {
      await fetchAdminProfile(userToken, currentFetchId);
    }
  };

  const signIn = async (access_token: string, refresh_token: string) => {
    setUserToken(access_token);
    await storeAuthTokens(access_token, refresh_token);
    const firstSignInValue = await getSecureToken(FIRST_SIGN_SIGN_IN);
    setIsFirstSignIn(firstSignInValue === null);
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
        isFirstSignIn,
        refreshAdminData,
        updateFirstSignInStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Default export for Expo Router
export default AuthProvider;
