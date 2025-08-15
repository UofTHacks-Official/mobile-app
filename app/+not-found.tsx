import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Home } from "lucide-react-native";
import { Image, Pressable, SafeAreaView, Text, View } from "react-native";

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
            We can't seem to find the page you're looking for😅.
          </Text>

          <View className="w-full space-y-4">
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
