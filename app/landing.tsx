import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

const LandingPage = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [showCover, setShowCover] = useState(true);

  const handleGetStarted = () => {
    haptics.impactAsync(ImpactFeedbackStyle.Medium);
    router.push("/auth/selectRole");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCover(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      className={cn(
        "flex-1 relative",
        isDark ? "bg-[#212121]" : "bg-[#ffffff]"
      )}
    >
      {isDark ? (
        <LottieView
          source={require("../assets/lottie/dark_landing.json")}
          autoPlay
          loop={false}
          style={{ flex: 1 }}
        />
      ) : (
        <View
          className={cn("flex-1", isDark ? "bg-[#212121]" : "bg-[#ffffff]")}
        >
          <LottieView
            source={require("../assets/lottie/light_landing.json")}
            autoPlay
            loop={false}
            style={{ flex: 1 }}
          />
        </View>
      )}

      {showCover && (
        <View
          className="absolute inset-0"
          style={{
            backgroundColor: isDark ? "#212121" : "#ffffff",
          }}
        />
      )}

      <View className="absolute bottom-0 left-0 right-0 px-8 pb-6">
        <Pressable
          className={cn(
            "items-center bg-space-grey w-full py-4 rounded-md mb-4",
            themeStyles.primaryButtonColorBg
          )}
          onPress={handleGetStarted}
        >
          <Text className={cn(themeStyles.primaryText1, "font-semibold")}>
            Get Started
          </Text>
        </Pressable>

        <Text
          className={cn(
            "text-xs text-center",
            themeStyles.primaryText,
            "opacity-80"
          )}
        >
          © 2025 UofT Hacks. Built with ❤️ in Toronto
        </Text>
      </View>
    </View>
  );
};

export default LandingPage;
