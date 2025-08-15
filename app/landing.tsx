import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ImageBackground, Pressable, Text, View } from "react-native";

const LandingPage = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/auth/selectRole");
  };

  return (
    <View className="flex-1 relative">
      <ImageBackground
        source={
          isDark
            ? require("../assets/images/bg/uoft_night.png")
            : require("../assets/images/bg/uoft_light.png")
        }
        className="flex-1"
        resizeMode="cover"
        imageStyle={{ resizeMode: "cover" }}
      />

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
