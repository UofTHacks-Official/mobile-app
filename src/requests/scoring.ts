import { SubmitScoreRequest, SubmitScoreResponse } from "@/types/scoring";
import { axiosInstance } from "./axiosConfig";

export const scoringEndpoints = {
  UPDATE_SCORE: "/api/v13/judges/update_score",
};

/**
 * Submit judging scores for a project
 */
export const submitScore = async (
  scoreData: SubmitScoreRequest
): Promise<SubmitScoreResponse> => {
  const response = await axiosInstance.post<string>(
    scoringEndpoints.UPDATE_SCORE,
    scoreData
  );
  return { message: response.data };
};
