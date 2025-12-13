// Project types based on API documentation

export interface Project {
  project_id: number;
  team_id: number;
  project_name: string;
  project_description: string;
  github_link: string;
  devpost_link: string;
  demo_link: string;
  team_name: string;
  team_members: string[];
  categories: string[];
  current_score: number;
}

export interface ProjectListResponse {
  projects: Project[];
}
