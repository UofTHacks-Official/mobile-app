import { devError, devLog } from "../logger";

/**
 * Extracts the request data (admin_username and admin_password) from the config.data string.
 * @param {object} response The full response object.
 * @returns {object|null} An object containing admin_username and admin_password, or null if parsing fails.
 */

export function getRequestData(response: any) {
  try {
    // The request data is a stringified JSON within response.config.data
    const configDataString = response.response.config.data;
    const parsedData = JSON.parse(configDataString);
    return {
      admin_username: parsedData.admin_username,
      admin_password: parsedData.admin_password,
    };
  } catch (e) {
    devError("Error parsing request data:", e);
    return null;
  }
}

/**
 * Extracts both the access token and refresh token from the response.data.
 * @param {object} response The full response object.
 * @returns {object|null} An object containing access_token and refresh_token, or null if not found.
 */
export function getAuthTokens(response: any) {
  try {
    const { access_token, refresh_token } = response.response.data;
    if (access_token && refresh_token) {
      return { access_token, refresh_token };
    }
    return null;
  } catch (e) {
    devLog("Error accessing auth tokens:", e);
    return null;
  }
}

// Default export for Expo Router
