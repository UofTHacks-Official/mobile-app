// AuthContext.tsx
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
import type { Admin } from "../_requests/admin";
import { getAdminProfile } from "../_requests/admin";
import { authEventEmitter } from "../_utils/eventEmitter";
import {
  FIRST_SIGN_SIGN_IN,
  getAuthTokens,
  getSecureToken,
  removeAuthTokens,
  removeSecureToken,
  storeAuthTokens,
} from "../_utils/tokens/secureStorage";

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
    console.log("[LOG] Signing out");
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await removeAuthTokens();
      setUserToken(null);
      setIsFirstSignIn(false);
      setAdminData(null); // Added
      await removeSecureToken(FIRST_SIGN_SIGN_IN); //uncomment this line if you want to test onboarding flow
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
          const firstSignInValue = await getSecureToken(FIRST_SIGN_SIGN_IN);
          setIsFirstSignIn(firstSignInValue === null);
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
  const fetchAdminProfile = useCallback(
    async (token: string, fetchId: number) => {
      if (!token) return; // Prevent fetching if token is null
      setAdminLoading(true);
      try {
        const result = await getAdminProfile(token);
        if (result.error) {
          console.error("Error fetching admin profile:", result.error);
          return;
        }
        if (result.response) {
          // Only update state if this is the latest fetch
          if (fetchIdRef.current === fetchId) {
            setAdminData(result.response.data as Admin);
          }
        } else {
          // Stale response, do not update state
          console.log("Stale fetchAdminProfile response ignored.");
        }
      } catch (error) {
        console.error("Error fetching admin profile:", error);
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
      console.log("AuthContext: userToken changed, fetching admin profile.");
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
    console.log(`[SIGN IN] - First time sign in value ${firstSignInValue}`);
    console.log(
      `[SIGN IN]- Is first time sign in? ${firstSignInValue === null}`
    );
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
