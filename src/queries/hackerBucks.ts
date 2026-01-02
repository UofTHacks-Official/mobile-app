import {
  deductHackerBucks,
  getHackerQRCode,
  hackerBucksObject,
  sendHackerBucks,
} from "@/requests/hackerBucks";
import { useMutation, useQuery } from "@tanstack/react-query";

// Send hacker bucks mutation
export const useSendHackerBucks = () => {
  return useMutation({
    mutationFn: (hackerBucksData: hackerBucksObject) =>
      sendHackerBucks(hackerBucksData),
    mutationKey: ["hacker-bucks", "send"],
  });
};

// Deduct hacker bucks mutation
export const useDeductHackerBucks = () => {
  return useMutation({
    mutationFn: (hackerBucksData: hackerBucksObject) =>
      deductHackerBucks(hackerBucksData),
    mutationKey: ["hacker-bucks", "deduct"],
  });
};

// Fetch a hacker's QR code by user ID
export const useHackerQRCode = (userId?: number | null) => {
  return useQuery({
    queryKey: ["hacker-qr-code", userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("Missing user ID for QR code");
      }
      return getHackerQRCode(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};
