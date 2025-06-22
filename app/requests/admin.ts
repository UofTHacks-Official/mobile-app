import { axiosInstance } from './axiosConfig';

export const loginEndpoints = {
  ADMIN_LOGIN: "/api/v13/admins/login",
  ADMIN_LOGOUT: "/api/v13/admins/logout",
  ADMIN_TOKEN_REFRESH: "/api/v13/admins/refresh",
  LIST_ADMINS:"/api/v13/admins", // admin manager only
  ADMIN_PROFILE:"/api/v13/admins/profile", // get profile of the currently authenticated admin
  CREATE_ADMIN:"/api/v13/admins",
  GET_ADMIN_BY_TOKEN: "/api/v13/admins/{admin_id}",
  // --------------------------------------------//
  HACKER_HUCKS_ADD: "/api/v13/admins/hacker-bucks/add",
  HACKER_HUCKS_DEDUCT: "/api/v13/admins/hacker-bucks/deduct"
};

export interface Admin {
  admin_username: string;
  admin_password: string;
  admin_fname: string;
  admin_lname: string;
  admin_role: string;
  is_admin_manager: boolean;
  is_marking_manager: boolean;
  is_shift_manager: boolean;
}

/**
 * Authenticates an admin user with email and password.
 * @param {string} email Admin's username/email.
 * @param {string} password Admin's password.
 * @returns {Promise<object>} Promise resolving to { response } or { error }.
 */
export const adminLogin = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post(
      loginEndpoints.ADMIN_LOGIN,
      {
        admin_username: email, 
        admin_password: password,
      }
    );
    return { response };
  } catch (error) {
    return { error };
  }
};

/**
 * Logs out an admin user.
 * @param {string} access_token Current access token.
 * @param {string} refresh_token Current refresh token.
 * @returns {Promise<object>} Promise resolving to { response } or { error }.
 */
export const adminLogout = async (access_token: string, refresh_token: string) => {
    try {
      const response = await axiosInstance.post(
        loginEndpoints.ADMIN_LOGOUT,
        {
            access_token,
            refresh_token,
        }
      );
      return { response };
    } catch (error) {
      return { error };
    }
  };

/**
 * Refreshes the admin's authentication token.
 * @param {string} refresh_token Current refresh token.
 * @returns {Promise<object>} Promise resolving to { response } or { error }.
 */
export const refreshAdminToken = async (refresh_token: string) => {
    try {
      const response = await axiosInstance.post(
        loginEndpoints.ADMIN_TOKEN_REFRESH,
        {
            refresh_token,
        }
      );
      return { response };
    } catch (error) {
      return { error };
    }
  };

/**
 * Lists all admin users (Note: This function currently uses the token refresh endpoint, which may be a bug).
 * @param {string} refresh_token Refresh token.
 * @returns {Promise<object>} Promise resolving to { response } or { error }.
 */
export const listAdmin = async (refresh_token: string) => {
    try {
      const response = await axiosInstance.post(
        loginEndpoints.ADMIN_TOKEN_REFRESH,
        {
            refresh_token,
        }
      );
      return { response };
    } catch (error) {
      return { error };
    }
  };

/**
 * Creates a new admin user.
 * @param {Admin} adminObject Admin object containing admin details (username, password, name, role, and manager flags).
 * @returns {Promise<object>} Promise resolving to { response } or { error }.
 */
export const createAdmin = async (adminObject: Admin)=>{
    try{
      const response = await axiosInstance.post(
        loginEndpoints.CREATE_ADMIN,
        {
          adminObject
        }
      );
      return {response}
    }catch(error){
      return(error);
    }
  }

/**
 * Retrieves admin information by ID.
 * @param {string} admin_id Admin's unique identifier.
 * @returns {Promise<object>} Promise resolving to { response } or { error }.
 */
export const getAdminByToken = async (admin_id: string) => {
    try {
      const response = await axiosInstance.get<Admin>(
        loginEndpoints.GET_ADMIN_BY_TOKEN.replace("{admin_id}", admin_id)
      );
      return { response };
    } catch (error) {
      return { error };
    }
}

/**
 * Retrieves the profile of the currently authenticated admin.
 * @param {string} bearerToken Authentication token for the current admin.
 * @returns {Promise<object>} Promise resolving to { response } or { error }.
 */
export const getAdminProfile = async (bearerToken: string) => {
    try {
      const response = await axiosInstance.get(
        loginEndpoints.ADMIN_PROFILE,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`
          }
        }
      );
      return { response };
    } catch (error) {
      return { error };
    }
};

/**
 * Adds hacker bucks to a hacker's account.
 * @param {string} hackerId Hacker's unique identifier.
 * @param {number} amount Amount of hacker bucks to add.
 * @returns {Promise<object>} Promise resolving to { response } or { error }.
 */
export const addHackerBucks = async (hackerId: string, amount: number) => {
    try {
      const response = await axiosInstance.post(
        loginEndpoints.HACKER_HUCKS_ADD,
        {
          hacker_id: hackerId,
          amount: amount
        }
      );
      return { response };
    } catch (error) {
      return { error };
    }
  }

/**
 * Deducts hacker bucks from a hacker's account.
 * @param {string} hackerId Hacker's unique identifier.
 * @param {number} amount Amount of hacker bucks to deduct.
 * @returns {Promise<object>} Promise resolving to { response } or { error }.
 */
export const deductHackerBucks = async (hackerId: string, amount: number) => {
    try {
      const response = await axiosInstance.post(
        loginEndpoints.HACKER_HUCKS_DEDUCT,
        {
          hacker_id: hackerId,
          amount: amount
        }
      );
      return { response };
    } catch (error) {
      return { error };
    }
  }

// Default export for Expo Router
export default loginEndpoints;