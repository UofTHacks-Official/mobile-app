import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Pressable, SafeAreaView, Text, View } from "react-native";

const LandingPage = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/auth/selectRole");
  };

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <Pressable
        className="flex-1 justify-end items-center w-full px-8"
        onPress={handleGetStarted}
      >
        <View className="items-center bg-uoft_primary_blue w-full py-4 rounded-md">
          <Text className={cn(themeStyles.primaryText1)}>Get Started</Text>
        </View>
      </Pressable>
      <View className="px-2 pt-8">
        <Text className={cn("text-xs text-center", themeStyles.primaryText)}>
          © 2025 UofT Hacks. Built with ❤️ for the hackathon community.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default LandingPage;
