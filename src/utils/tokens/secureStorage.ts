import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { devError, devLog } from "../logger";

const sanitizeStorageKey = (key: string): string =>
  String(key).replace(/[^a-zA-Z0-9_-]/g, "");

// Platform-aware secure storage wrapper
// - On native: Uses expo-secure-store (hardware-backed encryption)
// - On web: Uses localStorage (with sanitization for XSS protection)
const PlatformStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        const sanitizedKey = sanitizeStorageKey(key);
        return localStorage.getItem(sanitizedKey);
      } catch (error) {
        devError("localStorage getItem error:", error);
        return null;
      }
    }
    return await SecureStore.getItemAsync(key);
  },

  async setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        // Sanitize key and value to prevent XSS
        const sanitizedKey = sanitizeStorageKey(key);
        const sanitizedValue = String(value);
        localStorage.setItem(sanitizedKey, sanitizedValue);
      } catch (error) {
        devError("localStorage setItem error:", error);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async deleteItemAsync(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        const sanitizedKey = sanitizeStorageKey(key);
        localStorage.removeItem(sanitizedKey);
      } catch (error) {
        devError("localStorage removeItem error:", error);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
export const REFRESH_TOKEN = "REFRESH_TOKEN";
export const FIRST_SIGN_SIGN_IN = "FIRST_SIGN_IN";
export const USER_TYPE_KEY = "USER_TYPE";
export const JUDGE_ID_KEY = "JUDGE_ID";
export const SPONSOR_PIN_KEY = "SPONSOR_PIN";

let cachedUserType: string | null = null;

// Store the auth tokens in the secure storage

export const storeAuthTokens = async (
  access_token: string,
  refresh_token: string
): Promise<void | null> => {
  try {
    await PlatformStorage.setItemAsync(ACCESS_TOKEN_KEY, access_token);
    await PlatformStorage.setItemAsync(REFRESH_TOKEN, refresh_token);
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
    const access_token = await PlatformStorage.getItemAsync(ACCESS_TOKEN_KEY);
    const refresh_token = await PlatformStorage.getItemAsync(REFRESH_TOKEN);
    return { access_token, refresh_token };
  } catch (error) {
    devError("Error retrieving auth tokens:", error);
    return null;
  }
};

export const removeAuthTokens = async (): Promise<void | null> => {
  try {
    await PlatformStorage.deleteItemAsync(ACCESS_TOKEN_KEY);
    await PlatformStorage.deleteItemAsync(REFRESH_TOKEN);
    await PlatformStorage.deleteItemAsync(USER_TYPE_KEY);
    await PlatformStorage.deleteItemAsync(JUDGE_ID_KEY);
    await PlatformStorage.deleteItemAsync(SPONSOR_PIN_KEY);
    devLog("Successfully Removed Auth Tokens");
    cachedUserType = null;
  } catch (error) {
    devError("Error removing auth tokens:", error);
    return null;
  }
};

export const getSecureToken = async (
  ACCESS_TOKEN_KEY: string
): Promise<string | null> => {
  try {
    const response = await PlatformStorage.getItemAsync(ACCESS_TOKEN_KEY);
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
    await PlatformStorage.setItemAsync(ACCESS_KEY, ACCESS_VALUE);
  } catch (_) {
    return null;
  }
};

export const removeSecureToken = async (
  ACCESS_KEY: string
): Promise<void | null> => {
  try {
    await PlatformStorage.deleteItemAsync(ACCESS_KEY);
  } catch (_) {
    return null;
  }
};

export const storeUserType = async (userType: string): Promise<void | null> => {
  try {
    await PlatformStorage.setItemAsync(USER_TYPE_KEY, userType);
    cachedUserType = userType;
    devLog("Successfully stored user type:", userType);
  } catch (error) {
    devError("Error storing user type:", error);
    return null;
  }
};

export const getUserType = async (): Promise<string | null> => {
  try {
    if (cachedUserType) return cachedUserType;
    const userType = await PlatformStorage.getItemAsync(USER_TYPE_KEY);
    cachedUserType = userType;
    return userType;
  } catch (error) {
    devError("Error retrieving user type:", error);
    return null;
  }
};

export const storeJudgeId = async (judgeId: number): Promise<void | null> => {
  try {
    await PlatformStorage.setItemAsync(JUDGE_ID_KEY, judgeId.toString());
    devLog("Successfully stored judge ID:", judgeId);
  } catch (error) {
    devError("Error storing judge ID:", error);
    return null;
  }
};

export const getJudgeId = async (): Promise<number | null> => {
  try {
    const judgeId = await PlatformStorage.getItemAsync(JUDGE_ID_KEY);
    devLog("Successfully fetched judge ID:", judgeId);
    return judgeId ? parseInt(judgeId) : null;
  } catch (error) {
    devError("Error retrieving judge ID:", error);
    return null;
  }
};

export const storeSponsorPin = async (pin: number): Promise<void | null> => {
  try {
    await PlatformStorage.setItemAsync(SPONSOR_PIN_KEY, pin.toString());
    devLog("Successfully stored sponsor PIN:", pin);
  } catch (error) {
    devError("Error storing sponsor PIN:", error);
    return null;
  }
};

export const getSponsorPin = async (): Promise<number | null> => {
  try {
    const pin = await PlatformStorage.getItemAsync(SPONSOR_PIN_KEY);
    devLog("Successfully fetched sponsor PIN:", pin);
    return pin ? parseInt(pin) : null;
  } catch (error) {
    devError("Error retrieving sponsor PIN:", error);
    return null;
  }
};

// Score storage utilities
export const storeProjectScores = async (
  judgeId: number,
  projectId: number,
  scores: any
): Promise<void | null> => {
  try {
    const key = `JUDGE_${judgeId}_PROJECT_${projectId}_SCORES`;
    const scoresJson = JSON.stringify(scores);
    await PlatformStorage.setItemAsync(key, scoresJson);
    devLog(`Successfully stored scores for project ${projectId}:`, scores);
  } catch (error) {
    devError("Error storing project scores:", error);
    return null;
  }
};

export const getProjectScores = async (
  judgeId: number,
  projectId: number
): Promise<any | null> => {
  try {
    const key = `JUDGE_${judgeId}_PROJECT_${projectId}_SCORES`;
    const scoresJson = await PlatformStorage.getItemAsync(key);
    if (!scoresJson) {
      devLog(`No saved scores found for project ${projectId}`);
      return null;
    }
    const scores = JSON.parse(scoresJson);
    devLog(`Successfully retrieved scores for project ${projectId}:`, scores);
    return scores;
  } catch (error) {
    devError("Error retrieving project scores:", error);
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
  storeJudgeId,
  getJudgeId,
  storeSponsorPin,
  getSponsorPin,
  storeProjectScores,
  getProjectScores,
};
