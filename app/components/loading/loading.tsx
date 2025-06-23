import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Text, View } from "react-native";

interface LoadingIndicatorProps {
  message?: string;
  size?: "small" | "large";
  color?: string;
  showSpinner?: boolean;
  variant?: "default" | "minimal" | "gradient";
}

export function LoadingIndicator({
  message = "",
  size = "large",
  color = "#2A398C", // uoft_primary_blue
  showSpinner = true,
  variant = "minimal",
}: LoadingIndicatorProps) {
  const renderContent = () => {
    switch (variant) {
      case "minimal":
        return (
          <View className="flex-row items-center justify-center space-x-2">
            {showSpinner && <ActivityIndicator size={size} color={color} />}
            <Text className="text-uoft_black font-pp text-base">{message}</Text>
          </View>
        );

      case "gradient":
        return (
          <View className="items-center justify-center p-6">
            <LinearGradient
              colors={["#2A398C", "#FF6F51"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
            >
              {showSpinner && (
                <ActivityIndicator size="large" color="#FFFFFF" />
              )}
            </LinearGradient>
            <Text className="text-uoft_black font-pp text-lg font-semibold text-center">
              {message}
            </Text>
          </View>
        );

      default:
        return (
          <View className="items-center justify-center p-8 rounded-2xl">
            {showSpinner && (
              <View className="mb-4">
                <ActivityIndicator size={size} color={color} />
              </View>
            )}
            <Text className="text-uoft_black font-pp text-lg text-center">
              {message}
            </Text>
            <View className="mt-4 flex-row space-x-1">
              {[0, 1, 2].map((index) => (
                <View
                  key={index}
                  className="w-2 h-2 bg-uoft_primary_blue rounded-full animate-pulse"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                  }}
                />
              ))}
            </View>
          </View>
        );
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-uoft_white">
      {renderContent()}
    </View>
  );
}

// Convenience components for common use cases
export function FullScreenLoader({ message }: { message?: string }) {
  return <LoadingIndicator message={message} variant="default" size="large" />;
}

export function InlineLoader({ message }: { message?: string }) {
  return <LoadingIndicator message={message} variant="minimal" size="small" />;
}

export function GradientLoader({ message }: { message?: string }) {
  return <LoadingIndicator message={message} variant="gradient" size="large" />;
}

// Simple spinner without text
export function Spinner({
  size = "large",
  color = "#2A398C",
}: {
  size?: "small" | "large";
  color?: string;
}) {
  return (
    <View className="items-center justify-center p-4">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

// Default export for Expo Router
export default LoadingIndicator;
