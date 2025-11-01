import { axiosInstance } from "./axiosConfig";

export const loginEndpoints = {
  ADMIN_LOGIN: "/api/v13/admins/login",
  ADMIN_LOGOUT: "/api/v13/admins/logout",
  ADMIN_TOKEN_REFRESH: "/api/v13/admins/refresh",
  LIST_ADMINS: "/api/v13/admins",
  ADMIN_PROFILE: "/api/v13/admins/profile",
  CREATE_ADMIN: "/api/v13/admins",
  GET_ADMIN_BY_TOKEN: "/api/v13/admins/{admin_id}",
  ADMIN_GOOGLE_AUTH: "/api/v13/admins/google-auth/token",
};

export interface Admin {
  admin_username: string;
  admin_role: string;
  admin_id: string;
  admin_fname: string;
  admin_lname: string;
  is_admin_manager: boolean;
  is_marking_manager: boolean;
  is_shift_manager: boolean;
  last_login: string;
}

/**
 * Authenticates an admin user with email and password.
 */
export const adminLogin = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post(loginEndpoints.ADMIN_LOGIN, {
      admin_username: email,
      admin_password: password,
    });
    return { response };
  } catch (error) {
    return { error };
  }
};

/**
 * Logs out an admin user.
 */
export const adminLogout = async (
  access_token: string,
  refresh_token: string
) => {
  try {
    const response = await axiosInstance.post(loginEndpoints.ADMIN_LOGOUT, {
      access_token,
      refresh_token,
    });
    return { response };
  } catch (error) {
    return { error };
  }
};

/**
 * Refreshes the admin's authentication token.
 */
export const refreshAdminToken = async (refresh_token: string) => {
  try {
    const response = await axiosInstance.post(
      loginEndpoints.ADMIN_TOKEN_REFRESH,
      refresh_token
    );
    return { response };
  } catch (error) {
    return { error };
  }
};

/**
 * Lists all admin users (Note: This function currently uses the token refresh endpoint, which may be a bug).
 */
export const listAdmin = async (refresh_token: string) => {
  try {
    const response = await axiosInstance.post(
      loginEndpoints.ADMIN_TOKEN_REFRESH,
      refresh_token
    );
    return { response };
  } catch (error) {
    return { error };
  }
};

/**
 * Retrieves admin information by ID.
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
};

/**
 * Retrieves the profile of the currently authenticated admin.
 */
export const getAdminProfile = async (bearerToken: string) => {
  try {
    const response = await axiosInstance.get(loginEndpoints.ADMIN_PROFILE, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });
    return { response };
  } catch (error) {
    return { error };
  }
};

export interface AdminAuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface GoogleAuthAdminRequest {
  code: string;
  code_verifier: string;
  redirect_uri: string;
}

/**
 * Authenticates an admin using Google OAuth authorization code + PKCE
 * @param code Google OAuth authorization code
 * @param code_verifier PKCE code verifier
 * @param redirect_uri OAuth redirect URI used in the authorization request
 * @returns Authentication response with access and refresh tokens
 */
export const googleAuthAdmin = async (
  code: string,
  code_verifier: string,
  redirect_uri: string
) => {
  try {
    const response = await axiosInstance.post<AdminAuthResponse>(
      loginEndpoints.ADMIN_GOOGLE_AUTH,
      {
        code,
        code_verifier,
        redirect_uri,
      }
    );
    return { response };
  } catch (error) {
    return { error };
  }
};

// Default export for Expo Router
export default loginEndpoints;
