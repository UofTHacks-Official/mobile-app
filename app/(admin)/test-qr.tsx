import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import { axiosInstance } from "@/requests/axiosConfig";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

const TestQRScreen = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [userId, setUserId] = useState("");
  const [qrData, setQrData] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateQR = async () => {
    if (!userId || userId.trim() === "") {
      Toast.show({
        type: "error",
        text1: "Invalid User ID",
        text2: "Please enter a user ID",
      });
      return;
    }

    // Validate that it's a valid number
    const userIdNumber = Number(userId);
    if (isNaN(userIdNumber)) {
      Toast.show({
        type: "error",
        text1: "Invalid User ID",
        text2: "User ID must be a valid number",
      });
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const response = await axiosInstance.post("/api/v13/qr/get-qr", {
        userid: userIdNumber,
      });

      console.log("[QR] Response:", response.data);
      setQrData(response.data.qr_code || response.data);

      Toast.show({
        type: "success",
        text1: "QR Code Generated!",
        text2: `Successfully generated QR for user ${userId}`,
      });
    } catch (error: any) {
      console.error("[QR] Error details:", {
        status: error?.response?.status,
        data: error?.response?.data,
        detail: JSON.stringify(error?.response?.data?.detail, null, 2),
        message: error?.message,
      });

      let errorMessage = "Failed to generate QR code";

      // Handle validation errors
      if (error?.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail) && detail.length > 0) {
          errorMessage =
            detail[0]?.msg || detail[0]?.message || JSON.stringify(detail[0]);
        } else if (typeof detail === "string") {
          errorMessage = detail;
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: "error",
        text1: "Generation Failed",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 px-6 py-6">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            className="mb-4 flex-row items-center"
          >
            <ChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
            <Text
              className={cn("text-base font-pp ml-1", themeStyles.primaryText)}
            >
              Back
            </Text>
          </TouchableOpacity>

          <Text
            className={cn(
              "text-2xl font-onest-bold mb-4",
              themeStyles.primaryText
            )}
          >
            Test QR Code Generator
          </Text>

          <Text
            className={cn("text-sm font-pp mb-2", themeStyles.secondaryText)}
          >
            Enter Hacker User ID
          </Text>

          <TextInput
            className={cn(
              "p-4 rounded-xl text-base font-pp mb-4",
              isDark ? "bg-[#303030] text-white" : "bg-gray-100 text-black"
            )}
            placeholder="e.g., 1, 42, 123"
            placeholderTextColor={isDark ? "#888" : "#666"}
            value={userId}
            onChangeText={setUserId}
            keyboardType="numeric"
          />

          <Pressable
            onPress={handleGenerateQR}
            disabled={loading}
            className={cn(
              "py-4 rounded-xl mb-6",
              isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
            )}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={isDark ? "#000" : "#fff"}
              />
            ) : (
              <Text
                className={cn(
                  "text-center text-lg font-onest-bold",
                  isDark ? "text-black" : "text-white"
                )}
              >
                Generate QR Code
              </Text>
            )}
          </Pressable>

          {qrData && (
            <View className="items-center">
              <View
                className={cn(
                  "p-6 rounded-2xl",
                  isDark ? "bg-[#303030]" : "bg-white"
                )}
              >
                <QRCode value={qrData} size={250} />
              </View>
              <Text
                className={cn(
                  "text-xs font-pp mt-4 text-center",
                  themeStyles.secondaryText
                )}
              >
                Scan this QR code with the HackerBucks scanner
              </Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default TestQRScreen;
