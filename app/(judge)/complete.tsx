import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import { router } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, Text, View } from "react-native";

const JudgingComplete = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const handleDone = () => {
    haptics.impactAsync(ImpactFeedbackStyle.Light);
    router.replace("/landing");
  };

  return (
    <SafeAreaView className={cn("flex-1 px-6", themeStyles.background)}>
      <View className="flex-1 justify-center items-center gap-6">
        <View className="items-center gap-3">
          <View
            className={cn(
              "p-4 rounded-full",
              isDark ? "bg-[#1f1f1f]" : "bg-[#e6f3ff]"
            )}
          >
            <CheckCircle2 size={48} color={isDark ? "#75EDEF" : "#132B38"} />
          </View>
          <Text
            className={cn(
              "text-2xl font-onest-bold text-center",
              themeStyles.primaryText
            )}
          >
            All Rounds Complete
          </Text>
          <Text
            className={cn(
              "text-base font-pp text-center px-2",
              themeStyles.secondaryText
            )}
          >
            Thanks for judging! You’ve finished every round assigned to you.
          </Text>
        </View>

        <Pressable
          onPress={handleDone}
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
            Done
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default JudgingComplete;
