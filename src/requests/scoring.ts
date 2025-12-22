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
  console.log(
    "[SCORING API] Sending request to:",
    scoringEndpoints.UPDATE_SCORE
  );
  console.log(
    "[SCORING API] Request body:",
    JSON.stringify(scoreData, null, 2)
  );

  try {
    const response = await axiosInstance.post<string>(
      scoringEndpoints.UPDATE_SCORE,
      scoreData
    );
    console.log("[SCORING API] Success response:", response.data);
    return { message: response.data };
  } catch (error: any) {
    console.error("[SCORING API] Error:", {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      detail: JSON.stringify(error?.response?.data?.detail, null, 2),
      message: error?.message,
    });
    throw error;
  }
};
