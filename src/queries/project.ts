import { useQuery } from "@tanstack/react-query";
import {
  getProjectByTeamId,
  getProjectsForJudge,
  getProjectCategories,
} from "@/requests/project";

/**
 * Hook to fetch all projects assigned to a judge (via schedules)
 */
export const useProjects = (judgeId: number | null) => {
  return useQuery({
    queryKey: ["projects", judgeId],
    queryFn: () => getProjectsForJudge(judgeId!),
    enabled: !!judgeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Retry twice on failure
    retryDelay: 1000, // Wait 1 second between retries
  });
};

/**
 * Hook to fetch a specific project by team_id for a judge
 */
export const useProject = (judgeId: number | null, teamId: number | null) => {
  return useQuery({
    queryKey: ["project", judgeId, teamId],
    queryFn: () => getProjectByTeamId(judgeId!, teamId!),
    enabled: !!judgeId && !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Retry twice on failure
    retryDelay: 1000, // Wait 1 second between retries
  });
};

/**
 * Hook to fetch all available project categories
 */
export const useProjectCategories = () => {
  return useQuery({
    queryKey: ["projectCategories"],
    queryFn: () => getProjectCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes (categories don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: 1000,
  });
};
