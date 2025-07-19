import { CustomSplashScreen } from "@/components/loading/SplashScreen";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { openSettings } from "@/utils/camera/permissions";
import { cn, getThemeStyles } from "@/utils/theme";
import { Bell, CalendarCheck2Icon, User } from "lucide-react-native";
import { Pressable, SafeAreaView, Text, View } from "react-native";

const Profile = () => {
  const { signOut, adminData, adminLoading } = useAuth();
  const { isDark } = useTheme();
  const theme = getThemeStyles(isDark);

  const admin = adminData || {
    admin_username: "",
    admin_role: "",
    last_login: null,
  };

  return (
    <SafeAreaView className={cn("flex-1", theme.background)}>
      <View className="flex-1 px-6">
        <View className="mt-6">
          <Text
            className={cn("text-3xl font-onest-bold mb-2", theme.primaryText)}
          >
            Profile
          </Text>
          <Text className={cn("text-lg font-opensans", theme.primaryText)}>
            Manage your account settings
          </Text>
        </View>

        <View className="mt-12 gap-y-6">
          <View className={cn(theme.cardStyle, theme.cardBackground)}>
            <View className="flex-row items-center gap-2 mb-4">
              <User size={20} color={theme.iconColor} />
              <Text className={cn(theme.textPrimary, theme.cardText)}>
                Account Information
              </Text>
            </View>

            {adminLoading ? (
              <CustomSplashScreen />
            ) : adminData ? (
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className={cn(theme.textSecondary, theme.cardText)}>
                    Username:
                  </Text>
                  <Text className={cn(theme.textPrimary, theme.cardText)}>
                    {admin.admin_username}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={cn(theme.textSecondary, theme.cardText)}>
                    Role:
                  </Text>
                  <Text className={cn(theme.textPrimary, theme.cardText)}>
                    {admin.admin_role}
                  </Text>
                </View>
              </View>
            ) : (
              <View
                className={cn(
                  "my-4 p-2 items-center rounded-md",
                  theme.errorBackground
                )}
              >
                <Text className={cn(theme.textSecondary, theme.cardText)}>
                  Unable to load profile data
                </Text>
              </View>
            )}
          </View>

          {/* Notifications Section */}
          <Pressable
            className={cn(theme.cardStyle, theme.cardBackground)}
            onPress={openSettings}
            android_ripple={null}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View className="flex-row items-center gap-2">
              <Bell size={20} color={theme.iconColor} />
              <Text className={theme.cardText}>Notifications</Text>
            </View>

            <View
              className={cn(
                "my-4 p-2 items-center rounded-md",
                theme.errorBackground
              )}
            >
              <Text className={cn(theme.textSecondary, "text-black")}>
                Manage Notification Preferences
              </Text>
            </View>
          </Pressable>

          <View className={cn(theme.cardStyle, theme.cardBackground)}>
            <View className="flex-row items-center gap-2">
              <CalendarCheck2Icon size={20} color={theme.iconColor} />
              <Text className={theme.cardText}>Last Sign In</Text>
            </View>
            <View className="flex-row justify-between py-4">
              <Text className={cn(theme.textSecondary, theme.cardText)}>
                Last Sign In:
              </Text>
              <Text className={cn(theme.textPrimary, theme.cardText)}>
                {admin.last_login
                  ? new Date(
                      new Date(admin.last_login).getTime() - 4 * 60 * 60 * 1000
                    ).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }) + " EST"
                  : "Never"}
              </Text>
            </View>
          </View>

          <ThemeToggle />

          <Pressable
            className={cn(
              "p-2 px-6 rounded-md flex-row items-center justify-center",
              theme.cardBackground
            )}
            onPress={signOut}
            android_ripple={null}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text className="text-red-500 font-opensans">Sign Out</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
