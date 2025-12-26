export interface HackerProfile {
  hacker_id: number;
  hacker_fname: string;
  hacker_lname: string;
  hacker_email: string;
  school?: string;
  major?: string;
  skills?: string[];
  interest?: string[];
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface HackerQueryParams {
  skills?: string[];
  interests?: string[];
  school?: string;
  major?: string;
  search?: string;
}
