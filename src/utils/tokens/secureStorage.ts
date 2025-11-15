import * as SecureStore from "expo-secure-store";
import { devError, devLog } from "../logger";

export const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
export const REFRESH_TOKEN = "REFRESH_TOKEN";
export const FIRST_SIGN_SIGN_IN = "FIRST_SIGN_IN";
export const USER_TYPE_KEY = "USER_TYPE";

// Store the auth tokens in the secure storage

export const storeAuthTokens = async (
  access_token: string,
  refresh_token: string
): Promise<void | null> => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access_token);
    await SecureStore.setItemAsync(REFRESH_TOKEN, refresh_token);
  } catch (error) {
    devError("Error storing auth tokens:", error);
    return null;
  }
};

export const getAuthTokens = async (): Promise<{
  access_token: string | null;
  refresh_token: string | null;
} | null> => {
  try {
    const access_token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refresh_token = await SecureStore.getItemAsync(REFRESH_TOKEN);
    devLog(
      "Successfully Fetched - Auth Tokens:",
      access_token,
      "Refresh Tokens: ",
      refresh_token
    );
    return { access_token, refresh_token };
  } catch (error) {
    devError("Error retrieving auth tokens:", error);
    return null;
  }
};

export const removeAuthTokens = async (): Promise<void | null> => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(USER_TYPE_KEY);
    devLog("Successfully Removed Auth Tokens");
  } catch (error) {
    devError("Error removing auth tokens:", error);
    return null;
  }
};

export const getSecureToken = async (
  ACCESS_TOKEN_KEY: string
): Promise<string | null> => {
  try {
    const response = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    return response;
  } catch (_) {
    return null;
  }
};

export const setSecureToken = async (
  ACCESS_KEY: string,
  ACCESS_VALUE: string
): Promise<void | null> => {
  try {
    await SecureStore.setItemAsync(ACCESS_KEY, ACCESS_VALUE);
  } catch (_) {
    return null;
  }
};

export const removeSecureToken = async (
  ACCESS_KEY: string
): Promise<void | null> => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
  } catch (_) {
    return null;
  }
};

export const storeUserType = async (userType: string): Promise<void | null> => {
  try {
    await SecureStore.setItemAsync(USER_TYPE_KEY, userType);
    devLog("Successfully stored user type:", userType);
  } catch (error) {
    devError("Error storing user type:", error);
    return null;
  }
};

export const getUserType = async (): Promise<string | null> => {
  try {
    const userType = await SecureStore.getItemAsync(USER_TYPE_KEY);
    devLog("Successfully fetched user type:", userType);
    return userType;
  } catch (error) {
    devError("Error retrieving user type:", error);
    return null;
  }
};

export default {
  storeAuthTokens,
  getAuthTokens,
  removeAuthTokens,
  getSecureToken,
  setSecureToken,
  removeSecureToken,
  storeUserType,
  getUserType,
};
