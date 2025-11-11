import { AnimatedBell, NotificationCard } from "@/components/notifications";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { useUserTypeStore } from "@/reducers/userType";
import { registerPushToken } from "@/requests/push_token";
import { devError, devLog } from "@/utils/logger";
import { registerForPushNotificationsAsync } from "@/utils/notifications";
import { cn, getThemeStyles } from "@/utils/theme";
import { Camera } from "expo-camera";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Calendar, Camera as CameraIcon } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import CameraOwlSvg from "../../assets/images/animals/camera_owl.svg";

import GoatSvg from "../../assets/images/icons/Goat.svg";
import HedSvg from "../../assets/images/icons/Hed.svg";
import DeerSvg from "../../assets/images/icons/deer.svg";

import WelcomeDarkSvg from "../../assets/images/onboarding/onboard_dark.svg";
import WelcomeLightSvg from "../../assets/images/onboarding/onboard_light.svg";

interface OnboardingStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  feature: string;
  requiresAction?: boolean; // For permission screens
  actionLabel?: string;
  skipEnabled?: boolean;
}

// Build onboarding steps based on feature flags
const buildOnboardingSteps = (): OnboardingStep[] => {
  const steps: OnboardingStep[] = [
    {
      id: 0,
      icon: null, // Welcome SVG will be displayed
      title: "Welcome to UofT Hacks!",
      description:
        "Get ready for an amazing hackathon experience. Let's get you set up with all the features you'll need!",
      feature: "Welcome",
    },
  ];

  if (FEATURE_FLAGS.ENABLE_SCHEDULE) {
    steps.push({
      id: steps.length,
      icon: null,
      title: "View Event Schedule",
      description:
        "Browse all hackathon events, workshops, and activities. Tap on any event to see details and filter through event types.",
      feature: "Schedule",
    });
  }

  // Add notification permission screen
  steps.push({
    id: steps.length,
    icon: null,
    title: "Get Notified",
    description:
      "Keep up with important event updates and gain access to Photobooth.",
    feature: "Notifications",
    requiresAction: true,
    actionLabel: "Enable push notifications",
    skipEnabled: true,
  });

  // Add camera permission screen
  steps.push({
    id: steps.length,
    icon: null,
    title: "Scan & Capture",
    description:
      "We need camera access to scan QR codes for Photobooth and sending hacker bucks.",
    feature: "Camera",
    requiresAction: true,
    actionLabel: "Allow camera access",
    skipEnabled: true,
  });

  return steps;
};

const onboardingSteps: OnboardingStep[] = buildOnboardingSteps();

export default function OnboardingPage() {
  const { isDark } = useTheme();
  const { updateFirstSignInStatus } = useAuth();
  const { userType } = useUserTypeStore();
  const themeStyles = getThemeStyles(isDark);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getIconForStep = (step: OnboardingStep) => {
    switch (step.feature) {
      case "Welcome":
        return isDark ? (
          <WelcomeDarkSvg width={400} height={400} />
        ) : (
          <WelcomeLightSvg width={400} height={400} />
        );
      case "Schedule":
        return (
          <View className="w-full items-center">
            <Image
              source={require("../../assets/images/onboarding/schdule_preview.png")}
              style={{ width: 360, height: 360 }}
              resizeMode="contain"
            />
          </View>
        );
      case "Notifications":
        return (
          <View className="w-full gap-y-2">
            <View style={{ transform: [{ scale: 0.9 }] }} className="w-full">
              <NotificationCard
                icon={<DeerSvg width={40} height={40} />}
                title="Judging Schedules are out!"
                body="Check your schedule in the dashboard"
                timestamp="2h"
              />
            </View>
            <NotificationCard
              icon={<HedSvg width={40} height={40} />}
              title="📸 Photo Booth"
              body="Capture your 3am hacking setup"
              timestamp="1h"
            />
            <View style={{ transform: [{ scale: 0.9 }] }} className="w-full">
              <NotificationCard
                icon={<GoatSvg width={40} height={40} />}
                title="Lunch is delayed by 10 minutes!"
                body="Catering came late, we're hungry too"
                timestamp="2m"
              />
            </View>
          </View>
        );
      case "Camera":
        return (
          <View className="w-full items-center">
            <CameraOwlSvg width={200} height={200} />
          </View>
        );
      default:
        return null;
    }
  };

  const stepsWithIcons: OnboardingStep[] = onboardingSteps.map((step) => ({
    ...step,
    icon: getIconForStep(step),
  }));

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const token = await registerForPushNotificationsAsync();
      if (token && userType) {
        await registerPushToken(token, userType);
        Toast.show({
          type: "success",
          text1: "Notifications Enabled",
          text2: "You'll now receive important updates and alerts",
        });
        setCurrentStep(currentStep + 1);
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to Enable Notifications",
          text2: "Please check your device settings and try again",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Unexpected Error",
        text2: "Something went wrong while enabling notifications",
      });
      devLog(`[Notifications Error] ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCamera = async () => {
    setIsLoading(true);
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      devLog("Camera permission status:", status);
      if (status === "granted") {
        Toast.show({
          type: "success",
          text1: "Camera Permission Granted",
          text2: "You can now scan QR codes",
        });
      }
      // Complete onboarding and go to main app
      updateFirstSignInStatus(false);
      router.replace("/(admin)");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error Requesting Camera Permission",
        text2: "Please try again",
      });
      devError("Error requesting camera permission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const currentStepData = stepsWithIcons[currentStep];

    // Handle permission screens
    if (currentStepData.requiresAction) {
      if (currentStepData.feature === "Notifications") {
        await handleEnableNotifications();
      } else if (currentStepData.feature === "Camera") {
        await handleRequestCamera();
      }
    } else {
      // Regular navigation
      if (currentStep < onboardingSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        updateFirstSignInStatus(false);
        router.replace("/(admin)");
      }
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStep === onboardingSteps.length - 1) {
      // Last screen - complete onboarding
      updateFirstSignInStatus(false);
      router.replace("/(admin)");
    } else {
      // Move to next screen
      setCurrentStep(currentStep + 1);
    }
  };

  const currentStepData = stepsWithIcons[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? "#1C1C1E" : "#F6F5F8" }}
    >
      <View className="flex-1 px-8">
        <View
          className={cn(
            "flex-1 px-1",
            currentStepData.feature === "Notifications" ||
              currentStepData.feature === "Camera" ||
              currentStepData.feature === "Schedule"
              ? ""
              : "justify-center"
          )}
        >
          {currentStepData.feature === "Notifications" ||
          currentStepData.feature === "Camera" ||
          currentStepData.feature === "Schedule" ? (
            /* Notifications/Camera/Schedule layout: Icon, title, description, then illustration */
            <>
              <View className="mt-20 mb-12">
                <View
                  className="mb-2 w-14 h-14 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#F0EFF2" }}
                >
                  {currentStepData.feature === "Notifications" ? (
                    <AnimatedBell color="#99979B" size={32} />
                  ) : currentStepData.feature === "Camera" ? (
                    <CameraIcon color="#99979B" size={32} />
                  ) : (
                    <Calendar color="#99979B" size={32} />
                  )}
                </View>
                <Text
                  className={cn(
                    "text-3xl font-bold mb-2",
                    themeStyles.primaryText
                  )}
                >
                  {currentStepData.title}
                </Text>
                <Text className="text-base" style={{ color: "#99979B" }}>
                  {currentStepData.description}
                </Text>
              </View>
              <View className="w-full">{currentStepData.icon}</View>
            </>
          ) : (
            /* Default layout: Icon first, then title */
            <>
              <View className="mb-8 items-center w-full">
                {currentStepData.icon}
              </View>
              <View className="items-center">
                <Text
                  className={cn(
                    "text-2xl font-bold text-center mb-4",
                    themeStyles.primaryText
                  )}
                >
                  {currentStepData.title}
                </Text>
                <Text
                  className={cn(
                    "text-base text-center opacity-80",
                    themeStyles.primaryText
                  )}
                >
                  {currentStepData.description}
                </Text>
              </View>
            </>
          )}
        </View>
        {/* Navigation Buttons */}
        <View className="pb-4">
          <Pressable onPress={handleNext} disabled={isLoading}>
            <View
              className={cn(
                "py-4 px-2 rounded-full mb-2 items-center",
                themeStyles.primaryButtonColorBg
              )}
            >
              {isLoading ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text
                  className={cn(
                    "text-center font-semibold",
                    themeStyles.primaryText1
                  )}
                >
                  {currentStepData.actionLabel ||
                    (isLastStep ? "Get Started" : "Continue")}
                </Text>
              )}
            </View>
          </Pressable>

          {/* Not Now button - only for permission screens */}
          {currentStepData.requiresAction && (
            <Pressable
              onPress={handleSkip}
              disabled={isLoading}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <View className="py-4 px-2 items-center">
                <Text
                  className={cn(
                    "text-center font-semibold",
                    themeStyles.secondaryText
                  )}
                >
                  Not Now
                </Text>
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
