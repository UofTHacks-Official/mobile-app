// AuthContext.js
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAuthTokens,
  removeAuthTokens,
  storeAuthTokens
} from "../utils/tokens/secureStorage";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const checkToken = async () => {
      try {
        const tokens = await getAuthTokens();
        console.log("tokens:", tokens);
        if (tokens?.access_token) {
          setUserToken(tokens.access_token);
          router.replace("/admin");
        }
      } catch (error) {
        console.error("Error checking token:", error);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  const signIn = async (access_token, refresh_token) => {
    setUserToken(access_token);
    await storeAuthTokens(access_token, refresh_token);
  };

  const signOut = async () => {
    try {
      await removeAuthTokens();
      setUserToken(null);
      router.replace("/");
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
