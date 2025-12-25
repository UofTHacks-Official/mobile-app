import {
  JudgeLoginRequest,
  JudgeLoginResponse,
  JudgeRegisterRequest,
  JudgeRegisterResponse,
  JudgeSchedulesResponse,
  SponsorByPinResponse,
} from "@/types/judge";
import { axiosInstance } from "./axiosConfig";

export const judgeEndpoints = {
  SPONSOR_BY_PIN: "/api/v13/judges/sponsor-by-pin",
  LOGIN: "/api/v13/judges/login",
  REGISTER: "/api/v13/admins/judges/register",
  GET_SCHEDULES: "/api/v13/judges/{judge_id}/schedules",
};

/**
 * Get sponsor information by PIN
 */
export const getSponsorByPin = async (
  pin: number
): Promise<SponsorByPinResponse> => {
  const response = await axiosInstance.post<SponsorByPinResponse>(
    judgeEndpoints.SPONSOR_BY_PIN,
    { pin }
  );
  return response.data;
};

/**
 * Login as a judge using PIN and judge ID
 */
export const judgeLogin = async (
  credentials: JudgeLoginRequest
): Promise<JudgeLoginResponse> => {
  const response = await axiosInstance.post<JudgeLoginResponse>(
    judgeEndpoints.LOGIN,
    credentials
  );
  return response.data;
};

/**
 * Register a new judge with name and PIN
 */
export const registerJudge = async (
  registrationData: JudgeRegisterRequest
): Promise<JudgeRegisterResponse> => {
  const response = await axiosInstance.post<JudgeRegisterResponse>(
    judgeEndpoints.REGISTER,
    registrationData
  );
  return response.data;
};

/**
 * Get all schedules for a specific judge
 */
export const getJudgeSchedules = async (
  judgeId: number
): Promise<JudgeSchedulesResponse> => {
  const response = await axiosInstance.get<JudgeSchedulesResponse>(
    judgeEndpoints.GET_SCHEDULES.replace("{judge_id}", judgeId.toString())
  );
  return response.data;
};
