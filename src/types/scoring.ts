// Scoring types based on API documentation

export interface ScoringCriteria {
  design: number; // 0-3
  completion: number; // 0-4
  theme_relevance: number; // 0-3
  idea_innovation: number; // 0-5
  technology: number; // 0-5
  pitching: number; // 0-5
  time_management: number; // 0-2
}

export interface SubmitScoreRequest {
  project_id: number;
  score: number; // Total score (sum of criteria)
  max_score: number; // 100 or 27
  category: string; // Judge's category
  feedback: string; // Notes from judge
}

export interface SubmitScoreResponse {
  message: string;
}

export const SCORING_CRITERIA_INFO = {
  design: {
    title: "Design",
    maxScore: 3,
    description: "UI/UX quality, visual appeal, user experience",
    breakdown: `0 - No effort
1 - Effort was made but very basic/minimal
2 - Decent effort, functional and clean
3 - Exceptional effort, polished and professional`,
  },
  completion: {
    title: "Completion",
    maxScore: 4,
    description: "How finished is the project? Does it work?",
    breakdown: `0 - Project does not work / Demo does not work
1 - Project works but only has 1-2 features
2 - Project has a few features and they work
3 - Project is mostly complete with most features working
4 - Project is fully complete with all intended features working`,
  },
  theme_relevance: {
    title: "Theme Relevance",
    maxScore: 3,
    description: "How well does it align with the hackathon theme?",
    breakdown: `0 - Not related to theme at all
1 - Somewhat related but connection is weak
2 - Good connection to theme
3 - Excellent integration of theme into project`,
  },
  idea_innovation: {
    title: "Idea & Innovation",
    maxScore: 5,
    description: "Creativity, novelty, uniqueness of the idea",
    breakdown: `0 - Very common/basic idea with no innovation
1 - Common idea with minor tweaks
2 - Decent idea with some creative elements
3 - Good idea with notable innovation
4 - Very creative and innovative concept
5 - Exceptional innovation, highly unique and creative`,
  },
  technology: {
    title: "Technicality",
    maxScore: 5,
    description: "Technical complexity and implementation quality",
    breakdown: `0 - Minimal technical effort
1 - Basic implementation with simple tech
2 - Decent technical work with moderate complexity
3 - Good technical implementation with notable complexity
4 - Strong technical skills demonstrated
5 - Exceptional technical achievement and complexity`,
  },
  pitching: {
    title: "Pitching",
    maxScore: 5,
    description: "Presentation quality and communication",
    breakdown: `Clear explanation of what the project does (1 point)
Demonstrated the project well (1 point)
Explained the technical implementation (1 point)
Articulated the problem and solution (1 point)
Overall presentation quality and engagement (1 point)`,
  },
  time_management: {
    title: "Time",
    maxScore: 2,
    description: "Did the team manage time well? Delivered on time?",
    breakdown: `0 - Significantly over time or unprepared
1 - Slightly over/under time but acceptable
2 - Perfect timing and well-prepared`,
  },
};
