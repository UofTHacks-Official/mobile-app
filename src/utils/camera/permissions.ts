import { Linking } from "react-native";
import { devError } from "../logger";

export const openSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      devError("Error opening settings:", error);
    }
  };

  