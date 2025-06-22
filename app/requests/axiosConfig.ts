import axios, { AxiosInstance } from 'axios';

// Get base URL from environment variables
const baseURL = process.env.EXPO_PUBLIC_UOFT_STAGING;

// Create a basic axios instance for testing
export const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  timeout: 7500, // 7.5 seconds
});

// COMMENTED OUT: Complex token refresh logic for testing purposes
/*
import axiosRetry from 'axios-retry';
import { getAuthTokens, removeAuthTokens, storeAuthTokens } from '../utils/tokens/secureStorage';
import { loginEndpoints } from './admin';

// Enable request retries for network issues
axiosRetry(axiosInstance, { 
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000 // exponential backoff
});

// Flag to track if token refresh is in progress
let isRefreshing = false;

// Queue of requests that are waiting for token refresh
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Execute all queued requests with the new token
 * @param token New access token
 */
// const onRefreshed = (token: string): void => {
//   refreshSubscribers.forEach(callback => callback(token));
//   refreshSubscribers = [];
// };

// /**
//  * Add request to the queue
//  * @returns Promise that resolves when the token is refreshed
//  */
// const addSubscriber = (callback: (token: string) => void): void => {
//   refreshSubscribers.push(callback);
// };

// /**
//  * Handle refresh token error - typically by logging the user out
//  */
// const handleRefreshError = async (): Promise<void> => {
//   // Clear tokens
//   await removeAuthTokens();
  
//   // Redirect to login (this should be implemented by your auth context)
//   // You may want to dispatch an event or use a context method to handle this
//   console.log('Token refresh failed. User needs to login again.');
  
//   // Reset the refreshing flag
//   isRefreshing = false;
  
//   // Notify any pending requests that refresh failed
//   refreshSubscribers.forEach(callback => callback(''));
//   refreshSubscribers = [];
// };

// // Request interceptor to add auth token to all requests
// axiosInstance.interceptors.request.use(
//   async (config) => {
//     // Skip adding token for auth endpoints
//     const isAuthEndpoint = [
//       loginEndpoints.ADMIN_LOGIN,
//       loginEndpoints.ADMIN_TOKEN_REFRESH
//     ].some(endpoint => config.url?.includes(endpoint));

//     if (!isAuthEndpoint) {
//       try {
//         const tokens = await getAuthTokens();
//         if (tokens?.access_token) {
//           config.headers.Authorization = `Bearer ${tokens.access_token}`;
//         }
//       } catch (error) {
//         console.error('Error retrieving access token:', error);
//       }
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor to handle token refresh
// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error: AxiosError) => {
//     const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
//     // If there's no config, we can't retry
//     if (!originalRequest) {
//       return Promise.reject(error);
//     }

//     // Check if the error is due to an expired token (401 Unauthorized)
//     const isUnauthorized = error.response?.status === 401;
//     const isTokenEndpoint = originalRequest.url?.includes('/api/v13/admins/refresh');
//     const isLoginEndpoint = originalRequest.url?.includes('/api/v13/admins/login');
    
//     // Don't retry if this is already a retry, it's the token endpoint itself, or it's a login endpoint
//     if (isUnauthorized && !originalRequest._retry && !isTokenEndpoint && !isLoginEndpoint) {
//       originalRequest._retry = true;
      
//       // If a refresh is already in progress, add this request to the queue
//       if (isRefreshing) {
//         try {
//           // Create a new promise that will resolve when the token is refreshed
//           return new Promise((resolve, reject) => {
//             addSubscriber((token: string) => {
//               if (!token) {
//                 // Token refresh failed
//                 reject(error);
//                 return;
//               }
              
//               // Retry the original request with the new token
//               originalRequest.headers = originalRequest.headers || {};
//               originalRequest.headers.Authorization = `Bearer ${token}`;
//               resolve(axiosInstance(originalRequest));
//             });
//           });
//         } catch (refreshError) {
//           return Promise.reject(refreshError);
//         }
//       }
      
//       // Start the token refresh process
//       isRefreshing = true;
      
//       try {
//         // Get the refresh token
//         const tokens = await getAuthTokens();
        
//         if (!tokens?.refresh_token) {
//           throw new Error('No refresh token available');
//         }
        
//         // Call the refresh token API directly here to avoid circular dependency
//         const refreshResponse = await axiosInstance.post('/api/v13/admins/refresh', {
//           refresh_token: tokens.refresh_token,
//         });
        
//         if (!refreshResponse?.data?.access_token) {
//           throw new Error('Failed to refresh token');
//         }
        
//         // Extract the new tokens
//         const { access_token, refresh_token } = refreshResponse.data;
        
//         // Store the new tokens
//         await storeAuthTokens(access_token, refresh_token);
        
//         // Update authorization header for the original request
//         originalRequest.headers = originalRequest.headers || {};
//         originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
//         // Notify all the waiting requests that they can proceed with the new token
//         isRefreshing = false;
//         onRefreshed(access_token);
        
//         // Retry the original request with the new token
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         // Handle refresh token error - typically by logging out
//         await handleRefreshError();
//         return Promise.reject(error);
//       }
//     }
    
//     // For all other errors, just reject
//     return Promise.reject(error);
//   }
// );
// */

export default axiosInstance;

