import { axiosInstance } from "./axiosConfig";

export const hackerEndpoints = {
  HACKER_LOGIN: "/api/v13/hackers/login",
  HACKER_LOGOUT: "/api/v13/hackers/logout",
  HACKER_TOKEN_REFRESH: "/api/v13/hackers/refresh",
  HACKER_PROFILE: "/api/v13/hackers/profile",
  HACKER_AVATAR: "/api/v13/hackers/avatar/",
};

export interface Hacker {
  hacker_id: number;
  hacker_fname: string;
  hacker_lname: string;
  hacker_email: string;
  hacker_verified: boolean;
  hacker_completed_rsvp: boolean;
  hacker_discord?: string;
  hacker_personality?: string;
  hacker_bucks: number;
  pronoun?: string;
  application_status: string;
  age?: number;
  level_of_study?: string;
  school?: string;
  major?: string;
  dietary_condition?: string;
  team_id?: number;
}

/**
 * Authenticates a hacker user with email and password.
 */
export const hackerLogin = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post(hackerEndpoints.HACKER_LOGIN, {
      hacker_email: email,
      hacker_password: password,
    });
    return { response };
  } catch (error) {
    return { error };
  }
};

/**
 * Logs out a hacker user.
 */
export const hackerLogout = async (
  access_token: string,
  refresh_token: string
) => {
  try {
    const response = await axiosInstance.post(hackerEndpoints.HACKER_LOGOUT, {
      access_token,
      refresh_token,
    });
    return { response };
  } catch (error) {
    return { error };
  }
};

/**
 * Refreshes the hacker's authentication token.
 */
export const refreshHackerToken = async (refresh_token: string) => {
  try {
    const response = await axiosInstance.post(
      hackerEndpoints.HACKER_TOKEN_REFRESH,
      refresh_token
    );
    return { response };
  } catch (error) {
    return { error };
  }
};

/**
 * Retrieves the profile of the currently authenticated hacker.
 */
export const getHackerProfile = async (bearerToken: string) => {
  try {
    const response = await axiosInstance.get(hackerEndpoints.HACKER_PROFILE, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });
    return { response };
  } catch (error) {
    return { error };
  }
};

/**
 * Retrieves the avatar of the currently authenticated hacker.
 */
export const getHackerAvatar = async (bearerToken: string) => {
  try {
    const response = await axiosInstance.get(hackerEndpoints.HACKER_AVATAR, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });
    return { response };
  } catch (error) {
    return { error };
  }
};

export default hackerEndpoints;
