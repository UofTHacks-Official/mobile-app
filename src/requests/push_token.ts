import { devError, devLog } from "@/utils/logger";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { axiosInstance } from "./axiosConfig";

const pushTokenEndpoints = {
  REGISTER: "/api/v13/push-tokens/",
};

export type UserType = "hacker" | "admin" | "judge" | "volunteer";

export interface PushTokenObject {
  expo_push_token: string;
  user_type: UserType;
  device_platform: string;
  device_id?: string;
}

export async function registerPushToken(
  token: string,
  userType: UserType
): Promise<null> {
  try {
    const deviceId =
      Platform.OS === "ios"
        ? await Application.getIosIdForVendorAsync()
        : Application.getAndroidId();

    const pushTokenData: PushTokenObject = {
      expo_push_token: token,
      user_type: userType,
      device_platform: Platform.OS === "ios" ? "ios" : "android",
      device_id: deviceId || Constants.sessionId,
    };

    devLog(
      `[Push Token] Registering token for ${userType} on ${pushTokenData.device_platform} (device: ${pushTokenData.device_id})`
    );

    const response = await axiosInstance.post(
      pushTokenEndpoints.REGISTER,
      pushTokenData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    devLog("[Push Token] Successfully registered push token");
    return response.data;
  } catch (error) {
    devError("[Push Token] Failed to register push token:", error);
    throw error;
  }
}
