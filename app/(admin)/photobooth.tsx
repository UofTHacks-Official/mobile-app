import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PhotoboothPage() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1 justify-center items-center">

      </View>
    </SafeAreaView>
  );
}