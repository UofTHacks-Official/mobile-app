import { authEventEmitter } from "@/utils/eventEmitter";
import { devError, devLog } from "@/utils/logger";
import {
  getAuthTokens,
  removeAuthTokens,
  storeAuthTokens,
} from "@/utils/tokens/secureStorage";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";

const baseURL = process.env.EXPO_PUBLIC_UOFT_STAGING;

const ENDPOINTS_WITHOUT_AUTH = [
  // Auth endpoints
  "/api/v13/admins/login",
  "/api/v13/admins/refresh",
  "/api/v13/admins/google-auth/token",
  "/api/v13/hackers/google-auth/token",

  "/api/v13/hackers/schedules/",
] as const;

export const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 7500,
});

axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Execute all queued requests with the new token
 * @param token New access token
 */
const onRefreshed = (token: string): void => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Add request to the queue
 * @returns Promise that resolves when the token is refreshed
 */
const addSubscriber = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

/**
 * Check if an endpoint should skip token injection
 * @param url The request URL
 * @returns boolean indicating if auth should be skipped
 */
const shouldSkipAuth = (url: string): boolean => {
  return ENDPOINTS_WITHOUT_AUTH.some((endpoint) => url?.includes(endpoint));
};

const handleRefreshError = async (): Promise<void> => {
  await removeAuthTokens();

  devLog("Token refresh failed. Emitting onExpiredRefreshToken event.");
  authEventEmitter.emit("onExpiredRefreshToken");

  isRefreshing = false;

  refreshSubscribers.forEach((callback) => callback(""));
  refreshSubscribers = [];
};

axiosInstance.interceptors.request.use(
  async (config) => {
    if (!shouldSkipAuth(config.url!)) {
      try {
        // If a refresh is in progress, wait for it to complete
        if (isRefreshing && refreshPromise) {
          const newToken = await refreshPromise;
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
            return config;
          }
        }

        const tokens = await getAuthTokens();
        if (tokens?.access_token) {
          config.headers.Authorization = `Bearer ${tokens.access_token}`;
        }
      } catch (error) {
        devError("Error retrieving access token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthError =
      error.response?.status === 401 || error.response?.status === 403;
    const isTokenEndpoint = originalRequest.url?.includes(
      "/api/v13/admins/refresh"
    );
    const isLoginEndpoint = originalRequest.url?.includes(
      "/api/v13/admins/login"
    );

    if (
      isAuthError &&
      !originalRequest._retry &&
      !isTokenEndpoint &&
      !isLoginEndpoint
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        try {
          return new Promise((resolve, reject) => {
            addSubscriber((token: string) => {
              if (!token) {
                reject(error);
                return;
              }
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            });
          });
        } catch (_) {
          return Promise.reject(error);
        }
      }

      isRefreshing = true;

      // Create a promise for the refresh operation
      refreshPromise = (async () => {
        try {
          // Get the refresh token
          const tokens = await getAuthTokens();

          if (!tokens?.refresh_token) {
            throw new Error("No refresh token available");
          }

          const refreshResponse = await axiosInstance.post(
            "/api/v13/admins/refresh",
            {
              refresh_token: tokens.refresh_token,
            }
          );

          if (!refreshResponse?.data?.access_token) {
            throw new Error("Failed to refresh token");
          }

          const { access_token, refresh_token } = refreshResponse.data;

          await storeAuthTokens(access_token, refresh_token);

          return access_token;
        } catch (error) {
          await handleRefreshError();
          throw error;
        }
      })();

      try {
        const access_token = await refreshPromise;

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        isRefreshing = false;
        refreshPromise = null;
        onRefreshed(access_token);

        return axiosInstance(originalRequest);
      } catch (_) {
        isRefreshing = false;
        refreshPromise = null;
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
