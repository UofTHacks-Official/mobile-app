import { useMutation } from "@tanstack/react-query";
import { submitScore } from "@/requests/scoring";
import { SubmitScoreRequest } from "@/types/scoring";

/**
 * Hook to submit judging scores
 */
export const useSubmitScore = () => {
  return useMutation({
    mutationFn: (scoreData: SubmitScoreRequest) => submitScore(scoreData),
  });
};
