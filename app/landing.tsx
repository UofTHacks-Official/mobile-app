import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { ImageBackground, Pressable, Text, View } from "react-native";

const LandingPage = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [showCover, setShowCover] = useState(true);

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/auth/selectRole");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCover(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 relative">
      {isDark ? (
        <ImageBackground
          source={require("../assets/images/bg/uoft_night.png")}
          className="flex-1"
          resizeMode="cover"
          imageStyle={{ resizeMode: "cover" }}
        />
      ) : (
        <View className="flex-1" style={{ backgroundColor: '#ffffff' }}>
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
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          }}
        />
      )}

      <View className="absolute bottom-0 left-0 right-0 px-8 pb-6">
        <Pressable
          className="items-center bg-space-grey w-full py-4 rounded-full mb-4"
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
          © 2025 UofT Hacks. Built with ❤️ in Toronto, Ontario.
        </Text>
      </View>
    </View>
  );
};

export default LandingPage;
