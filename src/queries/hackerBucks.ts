import { useMutation } from '@tanstack/react-query';
import { sendHackerBucks, deductHackerBucks, hackerBucksObject } from '@/requests/hackerBucks';

// Send hacker bucks mutation
export const useSendHackerBucks = () => {
  return useMutation({
    mutationFn: (hackerBucksData: hackerBucksObject) => sendHackerBucks(hackerBucksData),
    mutationKey: ['hacker-bucks', 'send'],
  });
};

// Deduct hacker bucks mutation
export const useDeductHackerBucks = () => {
  return useMutation({
    mutationFn: (hackerBucksData: hackerBucksObject) => deductHackerBucks(hackerBucksData),
    mutationKey: ['hacker-bucks', 'deduct'],
  });
};