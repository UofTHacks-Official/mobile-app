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
  design: number;
  completion: number;
  theme_relevance: number;
  idea_innovation: number;
  technicality: number;
  pitching: number;
  time: number;
}

export interface SubmitScoreResponse {
  message: string;
}

export const SCORING_CRITERIA_INFO = {
  design: {
    title: "Design (Required)",
    maxScore: 3,
    description:
      "How well-designed is the project (UI/UX, aesthetics, accessibility)?",
    breakdown: `Required: Minimum score of 1

1 - Barely functional, minimal attention to design
2 - Functional with some attention to UI/UX
3 - Highly polished design with strong accessibility features`,
  },
  completion: {
    title: "Completion",
    maxScore: 4,
    description: "How complete is the project?",
    breakdown: `0 - Not functional
1 - Functional but buggy or missing major features
2 - Functional but missing polish (UI/UX)
3 - Functional with minor bugs but has non-trivial features
4 - Fully functional, polished, and bug-free`,
  },
  theme_relevance: {
    title: "Theme Relevance",
    maxScore: 3,
    description: "How well does the project tie into the theme?",
    breakdown: `0 - No connection to the theme
1 - Weak connection
2 - Moderate connection with some creative use
3 - Strong, creative connection`,
  },
  idea_innovation: {
    title: "Idea & Innovation",
    maxScore: 5,
    description:
      "How well the project identifies a relevant real-world problem and how original/novel the solution is",
    breakdown: `0 - Not useful or unoriginal
1 - Very basic idea
2 - Clear problem defined & mostly unoriginal with small creative touch
3 - Good solution with some creativity
4 - Very interesting idea & good use of creativity
5 - Highly impactful solution w/ multiple integrated creative ideas; distinctly original concept`,
  },
  technology: {
    title: "Technicality (Required)",
    maxScore: 5,
    description:
      "How effectively was technology used to implement the solution?",
    breakdown: `Required: Minimum score of 1

1 - Limited or overly simple use of technology for the problem
2 - Basic use of technology, but not fully aligned with the solution's needs
3 - Appropriate technology usage with some non-trivial features
4 - Well-structured, thoughtful use of technology that effectively supports the solution
5 - Highly innovative or efficient use of a complex tech stack, where each component is justified`,
  },
  pitching: {
    title: "Pitching (Required)",
    maxScore: 5,
    description: "How clear and effective was the pitch?",
    breakdown: `Required: Minimum score of 1

1 - Spoke clearly and audibly
2 - Explained the idea effectively
3 - Explained the data and technologies used
4 - Demo'd the project smoothly
5 - Well-organized presentation (both written and oral)`,
  },
  time_management: {
    title: "Time",
    maxScore: 2,
    description: "Did the team stay within the given time limit (6 minutes)?",
    breakdown: `0 - Went over by more than a minute
1 - Went over by less than 30 seconds
2 - Stayed within the given amount of time`,
  },
};
