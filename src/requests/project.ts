import { Project, ProjectListResponse } from "@/types/project";
import { getJudgeSchedules } from "./judge";

/**
 * Get all projects for a specific judge using their schedule assignments
 */
export const getProjectsForJudge = async (
  judgeId: number
): Promise<ProjectListResponse> => {
  const response = await getJudgeSchedules(judgeId);
  const projects = response.schedules
    .map((schedule) => schedule.team?.project)
    .filter((project): project is Project => Boolean(project));

  // Deduplicate by project_id since a judge may see the same project in multiple rounds
  const uniqueProjects = Array.from(
    new Map(projects.map((project) => [project.project_id, project])).values()
  );

  return { projects: uniqueProjects };
};

/**
 * Get a specific project by team_id from a judge's schedules
 */
export const getProjectByTeamId = async (
  judgeId: number,
  teamId: number
): Promise<Project | null> => {
  const response = await getProjectsForJudge(judgeId);
  return response.projects.find((p) => p.team_id === teamId) || null;
};
