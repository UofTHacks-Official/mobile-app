import { axiosInstance } from "./axiosConfig";

export const hackerEndpoints = {
  GOOGLE_AUTH: "/api/v13/hackers/google-auth/token",
} as const;

export interface HackerAuthResponse {
  access_token: string;
  refresh_token: string;
  hacker_id?: string;
  first_login?: boolean;
}

export interface GoogleAuthRequest {
  code: string;
  code_verifier: string;
}

/**
 * Authenticates a hacker using Google OAuth authorization code + PKCE
 * @param code Google OAuth authorization code
 * @param code_verifier PKCE code verifier
 * @returns Authentication response with access and refresh tokens
 */
export const googleAuthHacker = async (code: string, code_verifier: string) => {
  try {
    const response = await axiosInstance.post<HackerAuthResponse>(
      hackerEndpoints.GOOGLE_AUTH,
      {
        code,
        code_verifier,
      }
    );
    return { response };
  } catch (error) {
    return { error };
  }
};

export default hackerEndpoints;
