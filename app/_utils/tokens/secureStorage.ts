import * as SecureStore from "expo-secure-store";

// Using secure storage to ensure the access tokens are secure

export const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN'; 
export const REFRESH_TOKEN = 'REFRESH_TOKEN'; 
export const FIRST_SIGN_SIGN_IN = "FIRST_SIGN_IN" 


// Store the auth tokens in the secure storage 

export const storeAuthTokens = async (access_token: string, refresh_token: string): Promise<void | null> => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access_token);
    await SecureStore.setItemAsync(REFRESH_TOKEN, refresh_token);
  } catch (error) {
    console.error('Error storing auth tokens:', error);
    return null;
  }
};

export const getAuthTokens = async (): Promise<{ access_token: string | null; refresh_token: string | null } | null> => {
  try {
    const access_token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refresh_token = await SecureStore.getItemAsync(REFRESH_TOKEN);
    return { access_token, refresh_token };
  } catch (error) {
    console.error('Error retrieving auth tokens:', error);
    return null;
  }
};

export const removeAuthTokens = async (): Promise<void | null> => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN);
  } catch (error) {
    console.error('Error removing auth tokens:', error);
    return null;
  }
};

export const getSecureToken = async (ACCESS_TOKEN_KEY: string): Promise<string | null> => {
  try {
    const response = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    return response;
  } catch (_) {
    return null;
  }
};

export const setSecureToken = async (ACCESS_KEY: string, ACCESS_VALUE: string): Promise< void | null> => {
  try {
    await SecureStore.setItemAsync(ACCESS_KEY, ACCESS_VALUE);
  } catch (_) {
    return null;
  }
};

// Default export for Expo Router
export default {
  storeAuthTokens,
  getAuthTokens,
  removeAuthTokens,
  getSecureToken,
  setSecureToken
};



