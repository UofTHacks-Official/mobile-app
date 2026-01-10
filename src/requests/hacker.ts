import { axiosInstance } from "./axiosConfig";
import type { PaginatedResponse } from "@/types/pagination";

export const hackerEndpoints = {
  HACKER_LOGIN: "/api/v13/hackers/login",
  HACKER_LOGOUT: "/api/v13/hackers/logout",
  HACKER_TOKEN_REFRESH: "/api/v13/hackers/refresh",
  HACKER_PROFILE: "/api/v13/hackers/profile",
  HACKER_AVATAR: "/api/v13/hackers/avatar/",
  HACKERS_GET: "/api/v13/hackers/get",
  HACKER_BY_ID: "/api/v13/hackers",
  HACKER_RESUME: "/api/v13/hackers/application/resume",
  HACKER_GOOGLE_LOGIN: "/api/v13/hackers/google-auth/token",
  ADMIN_RESUME: "/api/v13/admins/applications",
};

export interface Hacker {
  hacker_id: number;
  application_id?: number;
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
  last_login?: string | null;
}

export interface HackerJob {
  role: string;
  company: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface HackerEducation {
  institution: string;
  program?: string | null;
  start_date: string;
  end_date?: string;
}

export interface HackerProfile extends Hacker {
  skills?: string[];
  interest?: string[];
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  preferred_name?: string;
  instagram_url?: string;
  x_url?: string;
  hacker_jobs?: HackerJob[];
  hacker_educations?: HackerEducation[];
  personalities?: any[];
  pronouns?: string | null;
  checked_in?: boolean;
}

export interface HackerQueryParams {
  skills?: string[];
  interests?: string[];
  companies?: string[];
  search_query?: string;
  start_grad_date?: string;
  end_grad_date?: string;
  num_results?: number;
  page?: number;
  page_size?: number;
  has_rsvpd?: boolean;
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
 *
 * @param bearerToken
 * @returns
 */
export const hackerGoogleLogin = async (
  code: string,
  code_verifier: string,
  redirect_uri: string
) => {};

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

/**
 * Fetch all hackers with optional filtering and pagination
 */
export const fetchHackers = async (
  queryParams: HackerQueryParams = {}
): Promise<PaginatedResponse<HackerProfile>> => {
  const response = await axiosInstance.post<PaginatedResponse<HackerProfile>>(
    hackerEndpoints.HACKERS_GET,
    queryParams
  );
  return response.data;
};

/**
 * Fetch a single hacker profile by ID
 */
export const fetchHackerById = async (
  hackerId: number
): Promise<HackerProfile> => {
  const response = await axiosInstance.get<HackerProfile>(
    `${hackerEndpoints.HACKER_BY_ID}/${hackerId}/profile`
  );
  return response.data;
};

/**
 * Get the resume URL for a hacker by application ID (admin access)
 */
export const getHackerResumeUrl = (applicationId: number): string => {
  return `${hackerEndpoints.ADMIN_RESUME}/${applicationId}/resume`;
};

/**
 * Get the authenticated hacker's resume URL
 */
export const getOwnResumeUrl = (): string => {
  return hackerEndpoints.HACKER_RESUME;
};

/**
 * Fetch a hacker's resume file (requires admin/judge authentication)
 */
export const fetchHackerResume = async (
  applicationId: number
): Promise<Blob> => {
  const response = await axiosInstance.get(
    `${hackerEndpoints.ADMIN_RESUME}/${applicationId}/resume`,
    {
      responseType: "blob",
    }
  );
  return response.data;
};

export default hackerEndpoints;
