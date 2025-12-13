// Scoring types based on API documentation

export interface ScoringCriteria {
  design: number; // 0-3
  completion: number; // 0-3
  theme_relevance: number; // 0-3
  idea_innovation: number; // 0-3
  technology: number; // 0-3
  pitching: number; // 0-3
  time_management: number; // 0-3
}

export interface SubmitScoreRequest {
  project_id: number;
  score: number; // Total score (sum of criteria)
  max_score: number; // 100 or 21
  category: string; // Judge's category
  feedback: string; // Notes from judge
}

export interface SubmitScoreResponse {
  message: string;
}

export const SCORING_CRITERIA_INFO = {
  design: "UI/UX quality, visual appeal, user experience",
  completion: "How finished is the project? Does it work?",
  theme_relevance: "How well does it align with the hackathon theme?",
  idea_innovation: "Creativity, novelty, uniqueness of the idea",
  technology: "Technical complexity and implementation quality",
  pitching: "Presentation quality and communication",
  time_management: "Did the team manage time well? Delivered on time?",
};
