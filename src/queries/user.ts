import type { Admin } from "@/requests/admin";
import { adminLogin, getAdminByToken, getAdminProfile } from "@/requests/admin";
import type { Hacker } from "@/requests/hacker";
import { hackerLogin, getHackerProfile } from "@/requests/hacker";
import { useMutation, useQuery } from "@tanstack/react-query";

/**
 * TanStack Query hook for fetching admin data by token
 * @param adminId - The admin ID to fetch
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns Query result with admin data
 */
export const useAdminByToken = (adminId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin", adminId],
    queryFn: async () => {
      const result = await getAdminByToken(adminId);

      if (result.error) {
        throw new Error("Failed to fetch admin data");
      }

      if (result.response) {
        return result.response.data as Admin;
      }

      throw new Error("No response or error received from getAdminByToken");
    },
    enabled: enabled && !!adminId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Retry up to 3 times, but not on 404 errors
      if (failureCount >= 3) return false;

      // Don't retry on 404 (admin not found)
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }

      return true;
    },
  });
};

/**
 * TanStack Query hook for fetching current admin profile
 * @param bearerToken - The bearer token for authentication
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns Query result with admin profile data
 */
export const useAdminProfile = (
  bearerToken: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      if (!bearerToken) {
        throw new Error("No bearer token provided");
      }

      const result = await getAdminProfile(bearerToken);

      if (result.error) {
        throw new Error("Failed to fetch admin profile");
      }

      if (result.response) {
        return result.response.data as Admin;
      }
    },
    enabled: enabled && !!bearerToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Retry up to 3 times, but not on 404 errors
      if (failureCount >= 3) return false;

      // Don't retry on 404 (admin not found)
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }

      return true;
    },
  });
};

/**
 * TanStack Query mutation hook for admin login
 * @returns Mutation result for admin login
 */
export const useAdminLogin = () => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const result = await adminLogin(email, password);

      if (result.error) {
        throw new Error("Login failed. Please check your credentials.");
      }

      if (result.response) {
        return result.response.data;
      }

      throw new Error("No response received from login attempt");
    },
  });
};

/**
 * TanStack Query mutation hook for hacker login
 * @returns Mutation result for hacker login
 */
export const useHackerLogin = () => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const result = await hackerLogin(email, password);

      if (result.error) {
        throw new Error("Login failed. Please check your credentials.");
      }

      if (result.response) {
        return result.response.data;
      }

      throw new Error("No response received from login attempt");
    },
  });
};

/**
 * TanStack Query hook for fetching hacker profile
 * @param bearerToken - The bearer token for authentication
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns Query result with hacker profile data
 */
export const useHackerProfile = (
  bearerToken: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["hacker-profile"],
    queryFn: async () => {
      if (!bearerToken) {
        throw new Error("No bearer token provided");
      }

      const result = await getHackerProfile(bearerToken);

      if (result.error) {
        throw new Error("Failed to fetch hacker profile");
      }

      if (result.response) {
        return result.response.data as Hacker;
      }
    },
    enabled: enabled && !!bearerToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (failureCount >= 3) return false;

      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }

      return true;
    },
  });
};
