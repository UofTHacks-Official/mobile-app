import { useTheme } from "@/context/themeContext";
import { getThemeStyles, cn } from "@/utils/theme";
import LottieView from "lottie-react-native";
import { View } from "react-native";

export function CustomSplashScreen() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  
  return (
    <View className={cn("flex-1 justify-center items-center", themeStyles.background)}>
      <LottieView
        source={require("../../../assets/lottie/moose.json")}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
}
