import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TimesUpScreen = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const handleBackToJudging = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/(admin)/judging");
  };

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1 justify-center items-center px-6">
        {/* Crying Axolotl Image */}
        <Image
          source={require("../../assets/images/animals/crying_ax.png")}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />

        {/* Time's Up Text */}
        <Text
          className={cn(
            "text-4xl font-onest-bold mt-8 mb-12",
            themeStyles.primaryText
          )}
        >
          Time&apos;s Up
        </Text>

        {/* Back to Judging Button */}
        <Pressable
          onPress={handleBackToJudging}
          className={cn(
            "w-full py-4 rounded-xl",
            isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
          )}
        >
          <Text
            className={cn(
              "text-center text-lg font-onest-bold",
              isDark ? "text-black" : "text-white"
            )}
          >
            Back to Judging
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default TimesUpScreen;
