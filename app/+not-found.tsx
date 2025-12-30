import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import { router } from "expo-router";
import { Home } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NotFoundPage = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4">
          <View className="w-10" />
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <Image
            source={require("../assets/images/animals/confused_owl.png")}
            style={{
              width: 200,
              height: 200,
              marginBottom: 32,
            }}
            resizeMode="contain"
          />

          <Text
            className={cn(
              "text-2xl font-onest-semibold mb-2",
              themeStyles.primaryText
            )}
          >
            Hmmmm...
          </Text>

          <Text
            className={cn(
              "text-base text-center mb-8",
              themeStyles.secondaryText
            )}
          >
            We can&apos;t seem to find the page you&apos;re looking for😅.
          </Text>

          <View className="w-full space-y-4">
            <Pressable
              onPress={() => {
                haptics.impactAsync(ImpactFeedbackStyle.Medium);
                router.replace("/(admin)");
              }}
              className={cn(
                "flex-row items-center justify-center py-4 px-6 rounded-full",
                themeStyles.cardBackground
              )}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Home size={20} color={themeStyles.iconColor} />
              <Text
                className={cn(
                  "ml-2 font-onest-semibold",
                  themeStyles.primaryText
                )}
              >
                Return Home
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NotFoundPage;
