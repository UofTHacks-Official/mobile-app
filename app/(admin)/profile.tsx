import { CustomSplashScreen } from "@/components/loading/SplashScreen";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { useUserTypeStore } from "@/reducers/userType";
import { openSettings } from "@/utils/camera/permissions";
import { useScrollNavBar } from "@/utils/navigation";
import { cn, getThemeStyles } from "@/utils/theme";
import {
  AlertTriangle,
  Bell,
  CalendarCheck2Icon,
  Camera,
  Coins,
  LogOut,
  User,
  X,
} from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { signOut, adminData, hackerData, profileLoading } = useAuth();
  const { userType } = useUserTypeStore();
  const { isDark } = useTheme();
  const theme = getThemeStyles(isDark);
  const [signOutModal, setSignOutModal] = useState(false);
  const { handleScroll } = useScrollNavBar();

  const admin = adminData || {
    admin_username: "",
    admin_role: "",
    last_login: null,
  };

  const hacker = hackerData;

  return (
    <SafeAreaView className={cn("flex-1", theme.background)}>
      <ScrollView
        className={cn("flex-1 px-6")}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
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

        <View className="mt-12 gap-y-6 pb-20">
          {/* Account Information */}
          <View>
            <View className="flex-row items-center gap-2 mb-3">
              <User size={20} color={theme.iconColor} />
              <Text
                className={cn(
                  "font-bold text-base",
                  theme.textPrimaryBold,
                  theme.primaryText
                )}
              >
                Account Information
              </Text>
            </View>

            {profileLoading ? (
              <View className={cn("p-4 rounded-md", theme.lightCardBackground)}>
                <CustomSplashScreen />
              </View>
            ) : hacker ? (
              <View
                className={cn(
                  "p-4 rounded-md space-y-3",
                  theme.lightCardBackground
                )}
              >
                <View className="flex-row justify-between">
                  <Text className={cn(theme.textSecondary, theme.cardText)}>
                    First Name:
                  </Text>
                  <Text className={cn(theme.textPrimary, theme.cardText)}>
                    {hacker.hacker_fname}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={cn(theme.textSecondary, theme.cardText)}>
                    Last Name:
                  </Text>
                  <Text className={cn(theme.textPrimary, theme.cardText)}>
                    {hacker.hacker_lname}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={cn(theme.textSecondary, theme.cardText)}>
                    Email:
                  </Text>
                  <Text className={cn(theme.textPrimary, theme.cardText)}>
                    {hacker.hacker_email}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={cn(theme.textSecondary, theme.cardText)}>
                    HackerBucks:
                  </Text>
                  <Text
                    className={cn(
                      theme.textPrimary,
                      theme.cardText,
                      "font-bold"
                    )}
                  >
                    {hacker.hacker_bucks ?? 0} HB
                  </Text>
                </View>
              </View>
            ) : adminData ? (
              <View
                className={cn(
                  "p-4 rounded-md space-y-3",
                  theme.lightCardBackground
                )}
              >
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
            ) : userType === "judge" ? (
              <View
                className={cn(
                  "p-4 rounded-md space-y-3",
                  theme.lightCardBackground
                )}
              >
                <View className="flex-row justify-between">
                  <Text className={cn(theme.textSecondary, theme.cardText)}>
                    Role:
                  </Text>
                  <Text className={cn(theme.textPrimary, theme.cardText)}>
                    Judge
                  </Text>
                </View>
              </View>
            ) : (
              <View
                className={cn(
                  "p-4 items-center rounded-md",
                  theme.lightCardBackground
                )}
              >
                <Text className={cn("text-base", theme.cardText)}>
                  Unable to load profile data
                </Text>
              </View>
            )}
          </View>

          {/* Notifications Section */}
          <View>
            <View className="flex-row items-center gap-2 mb-3">
              <Bell size={20} color={theme.iconColor} />
              <Text
                className={cn(
                  "font-bold text-base",
                  theme.textPrimaryBold,
                  theme.primaryText
                )}
              >
                Notifications
              </Text>
            </View>

            <Pressable
              className={cn(
                "p-4 items-center rounded-md",
                theme.lightCardBackground
              )}
              onPress={openSettings}
              android_ripple={null}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text className={cn("text-base", theme.cardText)}>
                Manage Notification Preferences
              </Text>
            </Pressable>
          </View>

          {/* Camera Permissions Section */}
          <View>
            <View className="flex-row items-center gap-2 mb-3">
              <Camera size={20} color={theme.iconColor} />
              <Text
                className={cn(
                  "font-bold text-base",
                  theme.textPrimaryBold,
                  theme.primaryText
                )}
              >
                Camera
              </Text>
            </View>

            <Pressable
              className={cn(
                "p-4 items-center rounded-md",
                theme.lightCardBackground
              )}
              onPress={openSettings}
              android_ripple={null}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text className={cn("text-base", theme.cardText)}>
                Manage Camera Preferences
              </Text>
            </Pressable>
          </View>

          {(adminData || hackerData) && (
            <View>
              <View className="flex-row items-center gap-2 mb-3">
                <CalendarCheck2Icon size={20} color={theme.iconColor} />
                <Text
                  className={cn(
                    "font-bold text-base",
                    theme.textPrimaryBold,
                    theme.primaryText
                  )}
                >
                  Last Sign In
                </Text>
              </View>
              <View
                className={cn(
                  "flex-row justify-between p-4 rounded-md",
                  theme.lightCardBackground
                )}
              >
                <Text className={cn(theme.textSecondary, theme.cardText)}>
                  Last Sign In:
                </Text>
                <Text className={cn(theme.textPrimary, theme.cardText)}>
                  {(hacker?.last_login ?? admin.last_login)
                    ? new Date(
                        new Date(
                          (hacker?.last_login ?? admin.last_login) || ""
                        ).getTime() -
                          5 * 60 * 60 * 1000
                      ).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "America/New_York",
                      }) + " EDT"
                    : "Never"}
                </Text>
              </View>
            </View>
          )}

          <ThemeToggle />

          <Pressable
            className={cn(
              "p-2 px-6 rounded-md flex-row items-start justify-start border border-[#ef4444]",
              theme.lightCardBackground
            )}
            onPress={() => {
              setSignOutModal(true);
            }}
            android_ripple={null}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View className="flex flex-row items-center  gap-x-2">
              <LogOut color="#ef4444" size={18} />
              <Text className="text-red-500 font-opensans">Sign Out</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={signOutModal}
        onRequestClose={() => setSignOutModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className={cn(
              "m-4 rounded-2xl p-8 items-center shadow-2xl min-w-[320px]",
              theme.lightCardBackground
            )}
          >
            <Pressable
              className="absolute top-4 right-4 p-1"
              onPress={() => setSignOutModal(false)}
            >
              <X size={20} color={theme.iconColor} />
            </Pressable>

            <View className="mb-6 p-4 rounded-full">
              <AlertTriangle size={32} color="#ef4444" />
            </View>

            <Text
              className={cn(
                "text-xl font-onest-bold mb-2 text-center",
                theme.primaryText
              )}
            >
              Sign Out
            </Text>

            <Text
              className={cn(
                "text-center mb-8 leading-6 font-opensans",
                theme.primaryText
              )}
            >
              Are you sure you want to sign out? You&apos;ll need to log in
              again to access your account.
            </Text>

            <View className="flex-row gap-x-4 w-full">
              <Pressable
                className={cn(
                  "flex-1 p-4 rounded-md",
                  isDark ? "bg-[#4a4a4a]" : "bg-gray-300"
                )}
                onPress={() => setSignOutModal(false)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  className={cn(
                    "text-center",
                    theme.textPrimaryBold,
                    theme.primaryText
                  )}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                className="flex-1 p-4 rounded-md bg-red-500"
                onPress={() => {
                  signOut();
                  setSignOutModal(false);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  className={cn(
                    "text-center text-white",
                    theme.textPrimaryBold
                  )}
                >
                  Sign Out
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
