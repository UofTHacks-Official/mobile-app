import axios from "axios";

const hackerBucksEndpoints = {
  SEND: "/api/v13/admins/hacker-bucks/add",
  DEDUCT: "/api/v13/admins/hacker-bucks/deduct",
};

// Ednpoints to add/deduct hacker bucks from a hacker

export interface hackerBucksObject {
  hacker_id: number;
  amount: number;
}

export async function sendHackerBucks(
  HackerBucksObject: hackerBucksObject
): Promise<null> {
  const response = await axios.post(
    hackerBucksEndpoints.SEND,
    HackerBucksObject
  );
  return response.data;
}

export async function deductHackerBucks(
  HackerBucksObject: hackerBucksObject
): Promise<null> {
  const response = await axios.post(
    hackerBucksEndpoints.DEDUCT,
    HackerBucksObject
  );
  return response.data;
}
