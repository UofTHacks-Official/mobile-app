import { useTheme } from "@/context/themeContext";
import { useAuth } from "@/context/authContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { router } from "expo-router";
import { ArrowLeft, Calendar, Coins, QrCode, Users } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WelcomeDarkSvg from "../../assets/images/onboarding/onboard_dark.svg";
import WelcomeLightSvg from "../../assets/images/onboarding/onboard_light.svg";

interface OnboardingStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  feature: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 0,
    icon: null, // Welcome SVG will be displayed
    title: "Welcome to UofT Hacks!",
    description:
      "Get ready for an amazing hackathon experience. Let's get you set up!",
    feature: "Welcome",
  },
  {
    id: 1,
    icon: null, // Will be set dynamically
    title: "View Event Schedule",
    description:
      "Browse all hackathon events, workshops, and activities. Tap on any event to see details and set reminders.",
    feature: "Schedule",
  },
  {
    id: 2,
    icon: null, // Will be set dynamically
    title: "Scan QR Codes",
    description:
      "Use the QR scanner to check into events, receive hacker bucks, and interact with sponsors.",
    feature: "QR Scanner",
  },
  {
    id: 3,
    icon: null, // Will be set dynamically
    title: "Earn Hacker Bucks",
    description:
      "Collect hacker bucks by attending events, completing challenges, and engaging with sponsors. Use them for prizes!",
    feature: "Hacker Bucks",
  },
  {
    id: 4,
    icon: null, // Will be set dynamically
    title: "Connect & Network",
    description:
      "Meet other hackers, join teams, and connect with mentors and sponsors throughout the event.",
    feature: "Networking",
  },
];

export default function OnboardingPage() {
  const { isDark } = useTheme();
  const { updateFirstSignInStatus } = useAuth();
  const themeStyles = getThemeStyles(isDark);
  const [currentStep, setCurrentStep] = useState(0);
  const progressAnim = useRef(
    new Animated.Value(1 / onboardingSteps.length)
  ).current;

  const stepsWithIcons: OnboardingStep[] = [
    {
      ...onboardingSteps[0],
      icon: isDark ? <WelcomeDarkSvg width={400} height={400} /> : <WelcomeLightSvg width={400} height={400} />,
    },
    {
      ...onboardingSteps[1],
      icon: <Calendar color={themeStyles.iconColor} size={48} />,
    },
    {
      ...onboardingSteps[2],
      icon: <QrCode color={themeStyles.iconColor} size={48} />,
    },
    {
      ...onboardingSteps[3],
      icon: <Coins color={themeStyles.iconColor} size={48} />,
    },
    {
      ...onboardingSteps[4],
      icon: <Users color={themeStyles.iconColor} size={48} />,
    },
  ];

  useEffect(() => {
    const progress = (currentStep + 1) / onboardingSteps.length;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      updateFirstSignInStatus(false);
      router.push("/(admin)");
    }
  };

  const currentStepData = stepsWithIcons[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1 px-8">
        {/* Progress Bar */}
        <View className="flex flex-row items-center py-4">
          {currentStep > 0 && (
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
        </View>
        <View className="flex-1 justify-center items-center px-4">
          {/* Icon/SVG */}
          <View className="mb-8 items-center">
            {currentStepData.icon}
          </View>

          {/* Title and Description */}
          <View className="items-center">
            <Text className={cn("text-2xl font-bold text-center mb-4", themeStyles.primaryText)}>
              {currentStepData.title}
            </Text>
            <Text className={cn("text-base text-center opacity-80", themeStyles.primaryText)}>
              {currentStepData.description}
            </Text>
          </View>
        </View>
        {/* Navigation Buttons */}
        <View className="pb-4">
          <Pressable onPress={handleNext}>
            <View className="py-4 px-2 bg-uoft_primary_blue rounded-full mb-4 items-center">
              <Text
                className={cn(
                  themeStyles.primaryText,
                  "text-center font-medium"
                )}
              >
                {isLastStep ? "Get Started" : "Continue"}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
