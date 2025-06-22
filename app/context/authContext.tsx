// AuthContext.tsx
import { router } from "expo-router";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getAuthTokens,
  removeAuthTokens,
  storeAuthTokens,
} from "../utils/tokens/secureStorage";

// Missing interface for the context value
interface AuthContextType {
  userToken: string | null;
  signIn: (access_token: string, refresh_token: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const tokens = await getAuthTokens();
        console.log("tokens:", tokens);
        if (tokens?.access_token) {
          setUserToken(tokens.access_token);
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

  const signIn = async (access_token: string, refresh_token: string) => {
    setUserToken(access_token);
    await storeAuthTokens(access_token, refresh_token);
  };

  const signOut = async () => {
    try {
      await removeAuthTokens();
      setUserToken(null);
      router.replace("/" as any);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Default export for Expo Router
export default AuthProvider;
