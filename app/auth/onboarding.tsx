import { useTheme } from "@/context/themeContext";
import { useAuth } from "@/context/authContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { router } from "expo-router";
import { ArrowLeft, Calendar, Camera as CameraIcon } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WelcomeDarkSvg from "../../assets/images/onboarding/onboard_dark.svg";
import WelcomeLightSvg from "../../assets/images/onboarding/onboard_light.svg";
import CameraOwlSvg from "../../assets/images/animals/camera_owl.svg";
import { Camera } from "expo-camera";
import { registerForPushNotificationsAsync } from "@/utils/notifications";
import { registerPushToken } from "@/requests/push_token";
import { useUserTypeStore } from "@/reducers/userType";
import { devLog, devError } from "@/utils/logger";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";

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
        "Browse all hackathon events, workshops, and activities. Tap on any event to see details and set reminders.",
      feature: "Schedule",
    });
  }

  if (FEATURE_FLAGS.ENABLE_PHOTOBOOTH) {
    steps.push({
      id: steps.length,
      icon: null,
      title: "Capture Memories",
      description:
        "Use the photobooth feature to take fun photos during the event and share your hackathon experience!",
      feature: "Photobooth",
    });
  }

  // Add notification permission screen
  steps.push({
    id: steps.length,
    icon: null,
    title: "Allow notifications",
    description:
      "We only send notifications for food alerts, event details, and important updates. No spam, promise!",
    feature: "Notifications",
    requiresAction: true,
    actionLabel: "Enable push notifications",
    skipEnabled: true,
  });

  // Add camera permission screen
  steps.push({
    id: steps.length,
    icon: null,
    title: "Allow camera access",
    description:
      "We need camera to sign in users and send hacker bucks via QR code scan.",
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
  const progressAnim = useRef(
    new Animated.Value(1 / onboardingSteps.length)
  ).current;

  const getIconForStep = (step: OnboardingStep) => {
    switch (step.feature) {
      case "Welcome":
        return isDark ? (
          <WelcomeDarkSvg width={400} height={400} />
        ) : (
          <WelcomeLightSvg width={400} height={400} />
        );
      case "Schedule":
        return <Calendar color={themeStyles.iconColor} size={48} />;
      case "Photobooth":
        return <CameraIcon color={themeStyles.iconColor} size={48} />;
      case "Notifications":
        return <CameraOwlSvg width={200} height={200} />;
      case "Camera":
        return <CameraOwlSvg width={200} height={200} />;
      default:
        return null;
    }
  };

  const stepsWithIcons: OnboardingStep[] = onboardingSteps.map((step) => ({
    ...step,
    icon: getIconForStep(step),
  }));

  useEffect(() => {
    const progress = (currentStep + 1) / onboardingSteps.length;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, progressAnim]);

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
    const currentStepData = stepsWithIcons[currentStep];

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
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1 px-8">
        {/* Progress Bar and Skip Button */}
        <View className="flex flex-row items-center py-4">
          {currentStep > 0 && !currentStepData.requiresAction && (
            <Pressable
              className="py-2 mr-4"
              onPress={() => setCurrentStep(currentStep - 1)}
              accessibilityLabel="Back"
            >
              <ArrowLeft color={themeStyles.iconColor} size={24} />
            </Pressable>
          )}
          <View className="flex-1 mr-2">
            <View className="h-3.5 bg-gray-200 rounded-full overflow-hidden">
              <Animated.View
                className="h-full bg-uoft_primary_blue rounded-full"
                style={{
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                }}
              />
            </View>
          </View>
          {currentStepData.skipEnabled && (
            <Pressable
              className="py-2 ml-2"
              onPress={handleSkip}
              accessibilityLabel="Skip"
            >
              <Text
                className={cn(
                  "underline text-gray-500",
                  themeStyles.skipButtonColor
                )}
              >
                Skip
              </Text>
            </Pressable>
          )}
        </View>
        <View className="flex-1 justify-center items-center px-4">
          {/* Icon/SVG */}
          <View className="mb-8 items-center">{currentStepData.icon}</View>

          {/* Title and Description */}
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
        </View>
        {/* Navigation Buttons */}
        <View className="pb-4">
          <Pressable onPress={handleNext} disabled={isLoading}>
            <View
              className={cn(
                "py-4 px-2 rounded-full mb-4 items-center",
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
        </View>
      </View>
    </SafeAreaView>
  );
}
