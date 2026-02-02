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

export interface ProjectCategory {
  project_category_id: number;
  project_category_name: string;
  category_description: string | null;
  sponsor_id: number | null;
  category_requirements: string | null;
}
