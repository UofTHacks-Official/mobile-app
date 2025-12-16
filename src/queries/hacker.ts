import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  fetchHackers,
  fetchHackerById,
  type HackerProfile,
  type HackerQueryParams,
} from "@/requests/hacker";

/**
 * Hook to fetch all hackers with optional filters
 */
export const useFetchHackers = (
  queryParams: HackerQueryParams
): UseQueryResult<HackerProfile[], Error> => {
  return useQuery<HackerProfile[], Error>({
    queryKey: ["hackers", queryParams],
    queryFn: () => fetchHackers(queryParams),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch a single hacker profile by ID
 */
export const useFetchHackerById = (
  hackerId: number
): UseQueryResult<HackerProfile, Error> => {
  return useQuery<HackerProfile, Error>({
    queryKey: ["hacker", hackerId],
    queryFn: () => fetchHackerById(hackerId),
    enabled: !!hackerId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};
