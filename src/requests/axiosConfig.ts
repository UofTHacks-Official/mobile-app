import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import { authEventEmitter } from '../_utils/eventEmitter';
import { getAuthTokens, removeAuthTokens, storeAuthTokens } from '../_utils/tokens/secureStorage';

// Get base URL from environment variables
const baseURL = process.env.EXPO_PUBLIC_UOFT_STAGING;

// List of endpoints that don't require token injection
const ENDPOINTS_WITHOUT_AUTH = [
  // Auth endpoints
  '/api/v13/admins/login',
  '/api/v13/admins/refresh',
  
  // Schedule endpoints (public access)
  '/api/v13/hackers/schedules',
] as const ;

// Create axios instance with full auth capabilities
export const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 7500,
});

axiosRetry(axiosInstance, { 
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000 // exponential backoff
});

// Flag to track if token refresh is in progress
let isRefreshing = false;

// Queue of requests that are waiting for token refresh
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Execute all queued requests with the new token
 * @param token New access token
 */
const onRefreshed = (token: string): void => {
  refreshSubscribers.forEach(callback => callback(token));
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
  return ENDPOINTS_WITHOUT_AUTH.some(endpoint => url?.includes(endpoint));
};

/**
 * Handle refresh token error - typically by logging the user out
 */
const handleRefreshError = async (): Promise<void> => {
  // Clear tokens
  await removeAuthTokens();
  
  // Emit an event to notify the auth context to log the user out
  console.log('Token refresh failed. Emitting onExpiredRefreshToken event.');
  authEventEmitter.emit('onExpiredRefreshToken');
  
  // Reset the refreshing flag
  isRefreshing = false;
  
  // Notify any pending requests that refresh failed
  refreshSubscribers.forEach(callback => callback(''));
  refreshSubscribers = [];
};

// Request interceptor to add auth token to all requests
axiosInstance.interceptors.request.use(
  async (config) => {
    // Skip adding token for endpoints that don't need auth
    if (!shouldSkipAuth(config.url!)) {
      try {
        const tokens = await getAuthTokens();
        if (tokens?.access_token) {
          config.headers.Authorization = `Bearer ${tokens.access_token}`;
        }
      } catch (error) {
        console.error('Error retrieving access token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // If there's no config, we can't retry
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Check if the error is due to an expired token (401 Unauthorized or 403 Forbidden)
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isTokenEndpoint = originalRequest.url?.includes('/api/v13/admins/refresh');
    const isLoginEndpoint = originalRequest.url?.includes('/api/v13/admins/login');
    
    // Don't retry if this is already a retry, it's the token endpoint itself, or it's a login endpoint
    if (isAuthError && !originalRequest._retry && !isTokenEndpoint && !isLoginEndpoint) {
      originalRequest._retry = true;
      
      // If a refresh is already in progress, add this request to the queue
      if (isRefreshing) {
        try {
          // Create a new promise that will resolve when the token is refreshed
          return new Promise((resolve, reject) => {
            addSubscriber((token: string) => {
              if (!token) {
                // Token refresh failed
                reject(error);
                return;
              }
              
              // Retry the original request with the new token
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            });
          });
        } catch (_) {
          return Promise.reject(error);
        }
      }
      
      // Start the token refresh process
      isRefreshing = true;
      
      try {
        // Get the refresh token
        const tokens = await getAuthTokens();
        
        if (!tokens?.refresh_token) {
          throw new Error('No refresh token available');
        }
        
        // Call the refresh token API directly here to avoid circular dependency
        const refreshResponse = await axiosInstance.post('/api/v13/admins/refresh', {
          refresh_token: tokens.refresh_token,
        });
        
        if (!refreshResponse?.data?.access_token) {
          throw new Error('Failed to refresh token');
        }
        
        // Extract the new tokens
        const { access_token, refresh_token } = refreshResponse.data;
        
        // Store the new tokens
        await storeAuthTokens(access_token, refresh_token);
        
        // Update authorization header for the original request
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        // Notify all the waiting requests that they can proceed with the new token
        isRefreshing = false;
        onRefreshed(access_token);
        
        // Retry the original request with the new token
        return axiosInstance(originalRequest);
      } catch (_) {
        // Handle refresh token error - typically by logging out
        await handleRefreshError();
        return Promise.reject(error);
      }
    }
    
    // For all other errors, just reject
    return Promise.reject(error);
  }
);

export default axiosInstance;

