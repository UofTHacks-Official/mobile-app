import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { OnboardingStep } from "./onboardingData";

interface OnboardingScreenProps {
  step: OnboardingStep;
  currentIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  isLast: boolean;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  step,
  currentIndex,
  totalSteps,
  onNext,
  onSkip,
  isLast,
}) => {
  return (
    <View className="flex-1 bg-white dark:bg-gray-900 px-6 py-12">
      {/* Skip Button */}
      <View className="flex-row justify-end mb-8">
        <TouchableOpacity onPress={onSkip} className="px-4 py-2">
          <Text className="text-gray-500 dark:text-gray-400 text-base font-medium underline">
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Container */}
      <View className="flex-1 justify-center items-center px-4">
        {/* Icon */}
        <View className="bg-blue-50 dark:bg-blue-900/30 rounded-full w-32 h-32 justify-center items-center mb-8">
          <Text className="text-6xl">{step.icon}</Text>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
          {step.title}
        </Text>

        {/* Description */}
        <Text className="text-lg text-gray-600 dark:text-gray-300 text-center leading-relaxed max-w-sm">
          {step.description}
        </Text>
      </View>

      {/* Bottom Section */}
      <View className="space-y-6">
        {/* Progress Dots */}
        <View className="flex-row justify-center gap-2">
          {Array.from({ length: totalSteps }, (_, index) => (
            <View
              key={index}
              className={`w-3 h-3 rounded-full mb-4 ${
                index === currentIndex
                  ? "bg-blue-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={onNext}
          className="bg-blue-500 rounded-2xl py-4 mx-4 shadow-lg active:scale-95"
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold text-center">
            {step.buttonText || (isLast ? "Get Started" : "Next")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
