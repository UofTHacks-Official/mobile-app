import { useQuery } from "@tanstack/react-query";
import { getProjectByTeamId, getProjectsByPin } from "@/requests/project";

/**
 * Hook to fetch all projects by sponsor PIN
 */
export const useProjects = (pin: number | null) => {
  return useQuery({
    queryKey: ["projects", pin],
    queryFn: () => getProjectsByPin(pin!),
    enabled: !!pin,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Retry twice on failure
    retryDelay: 1000, // Wait 1 second between retries
  });
};

/**
 * Hook to fetch a specific project by team_id
 */
export const useProject = (pin: number | null, teamId: number | null) => {
  return useQuery({
    queryKey: ["project", pin, teamId],
    queryFn: () => getProjectByTeamId(pin!, teamId!),
    enabled: !!pin && !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Retry twice on failure
    retryDelay: 1000, // Wait 1 second between retries
  });
};
