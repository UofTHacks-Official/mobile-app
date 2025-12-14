import axios from "axios";

const hackerBucksEndpoints = {
  SEND: "/api/v13/admins/hacker-bucks/add",
  DEDUCT: "/api/v13/admins/hacker-bucks/deduct",
  ADD_QR: "/api/v13/qr/add-hackerbux",
  DEDUCT_QR: "/api/v13/qr/deduct-hackerbux",
  CHECKIN: "/api/v13/qr/checkin",
};

// Endpoints to add/deduct hacker bucks from a hacker

export interface hackerBucksObject {
  hacker_id: number;
  amount: number;
}

export interface QRHackerBucksRequest {
  qr_code: string;
  amount: number;
}

export interface QRHackerBucksResponse {
  user_id: number;
  hacker_fname: string;
  hacker_lname: string;
  email: string;
  previous_bucks: number;
  new_bucks: number;
  amount_changed: number;
  message: string;
}

export interface CheckInRequest {
  user_id: number;
}

export interface CheckInResponse {
  message: string;
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

export async function addHackerBucksByQR(
  request: QRHackerBucksRequest
): Promise<QRHackerBucksResponse> {
  const response = await axios.post<QRHackerBucksResponse>(
    hackerBucksEndpoints.ADD_QR,
    request
  );
  return response.data;
}

export async function deductHackerBucksByQR(
  request: QRHackerBucksRequest
): Promise<QRHackerBucksResponse> {
  const response = await axios.post<QRHackerBucksResponse>(
    hackerBucksEndpoints.DEDUCT_QR,
    request
  );
  return response.data;
}

export async function checkInHacker(
  request: CheckInRequest
): Promise<CheckInResponse> {
  const response = await axios.post<CheckInResponse>(
    hackerBucksEndpoints.CHECKIN,
    request
  );
  return response.data;
}
