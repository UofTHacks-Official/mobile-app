import { Project, ProjectListResponse } from "@/types/project";
import { axiosInstance } from "./axiosConfig";

export const projectEndpoints = {
  PROJECT_LIST: "/api/v13/judges/projectlist",
};

/**
 * Get all projects for a specific sponsor PIN
 */
export const getProjectsByPin = async (
  pin: number
): Promise<ProjectListResponse> => {
  const response = await axiosInstance.get<ProjectListResponse>(
    projectEndpoints.PROJECT_LIST,
    {
      params: { pin },
    }
  );
  return response.data;
};

/**
 * Get a specific project by team_id (filters from projectlist)
 */
export const getProjectByTeamId = async (
  pin: number,
  teamId: number
): Promise<Project | null> => {
  const response = await getProjectsByPin(pin);
  return response.projects.find((p) => p.team_id === teamId) || null;
};
