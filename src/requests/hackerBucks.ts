import { axiosInstance } from "./axiosConfig";

const hackerBucksEndpoints = {
  SEND: "/api/v13/admins/hacker-bucks/add",
  DEDUCT: "/api/v13/admins/hacker-bucks/deduct",
  ADD_QR: "/api/v13/qr/add-hackerbux",
  DEDUCT_QR: "/api/v13/qr/deduct-hackerbux",
  CHECKIN: "/api/v13/qr/checkin",
  GET_QR: "/api/v13/qr/get-qr",
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
  qr_code: string;
}

export interface CheckInResponse {
  message: string;
}

export interface GetQRRequest {
  userid: number;
}

export interface GetQRResponse {
  qr_code: string;
}

export async function sendHackerBucks(
  HackerBucksObject: hackerBucksObject
): Promise<null> {
  const response = await axiosInstance.post(
    hackerBucksEndpoints.SEND,
    HackerBucksObject
  );
  return response.data;
}

export async function deductHackerBucks(
  HackerBucksObject: hackerBucksObject
): Promise<null> {
  const response = await axiosInstance.post(
    hackerBucksEndpoints.DEDUCT,
    HackerBucksObject
  );
  return response.data;
}

export async function addHackerBucksByQR(
  request: QRHackerBucksRequest
): Promise<QRHackerBucksResponse> {
  const response = await axiosInstance.post<QRHackerBucksResponse>(
    hackerBucksEndpoints.ADD_QR,
    request
  );
  return response.data;
}

export async function deductHackerBucksByQR(
  request: QRHackerBucksRequest
): Promise<QRHackerBucksResponse> {
  const response = await axiosInstance.post<QRHackerBucksResponse>(
    hackerBucksEndpoints.DEDUCT_QR,
    request
  );
  return response.data;
}

export async function checkInHacker(
  request: CheckInRequest
): Promise<CheckInResponse> {
  const response = await axiosInstance.post<CheckInResponse>(
    hackerBucksEndpoints.CHECKIN,
    request
  );
  return response.data;
}

export async function getHackerQRCode(userId: number): Promise<string> {
  const response = await axiosInstance.post<GetQRResponse>(
    hackerBucksEndpoints.GET_QR,
    { userid: userId }
  );
  return response.data.qr_code;
}
