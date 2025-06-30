import { Bell, CalendarCheck2Icon, User } from "lucide-react-native";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { useAuth } from "../context/authContext";

const Profile = () => {
  const { signOut, adminData, adminLoading } = useAuth();

  // Create a safe admin object with defaults
  const admin = adminData || {
    admin_fname: "",
    admin_lname: "",
    admin_username: "",
    admin_role: "",
    is_admin_manager: false,
    is_marking_manager: false,
    is_shift_manager: false,
    last_login: null,
  };

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 px-6 text-uoft_black">
        <View className="mt-6">
          <Text className="text-3xl font-onest-bold mb-2">Profile</Text>
          <Text className="text-lg font-opensans text-uoft_black">
            Manage your account settings
          </Text>
        </View>

        <View className="mt-12 gap-y-6">
          {/* Admin Information Section */}
          <View className="w-full bg-white p-4 px-6 rounded-sm">
            <View className="flex-row items-center gap-2 mb-4">
              <User size={20} color="#000" />
              <Text className="text-black font-opensans-medium">
                Account Information
              </Text>
            </View>

            {adminLoading ? (
              <View className="my-4 p-2 bg-uoft_grey_light items-center rounded-sm">
                <Text className="font-opensans">Loading profile...</Text>
              </View>
            ) : adminData ? (
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="font-opensans text-uoft_grey_medium">
                    Username:
                  </Text>
                  <Text className="font-opensans-medium">
                    {admin.admin_username}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-opensans text-uoft_grey_medium">
                    Role:
                  </Text>
                  <Text className="font-opensans-medium">
                    {admin.admin_role}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-opensans text-uoft_grey_medium">
                    Admin Manager:
                  </Text>
                  <Text className="font-opensans-medium">
                    {admin.is_admin_manager ? "Yes" : "No"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-opensans text-uoft_grey_medium">
                    Marking Manager:
                  </Text>
                  <Text className="font-opensans-medium">
                    {admin.is_marking_manager ? "Yes" : "No"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-opensans text-uoft_grey_medium">
                    Shift Manager:
                  </Text>
                  <Text className="font-opensans-medium">
                    {admin.is_shift_manager ? "Yes" : "No"}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="my-4 p-2 bg-uoft_grey_light items-center rounded-sm">
                <Text className="font-opensans">
                  Unable to load profile data
                </Text>
              </View>
            )}
          </View>

          <View className="w-full bg-white p-4 px-6 rounded-sm">
            <View className="flex-row items-center gap-2">
              <CalendarCheck2Icon size={20} color="#000" />
              <Text className="text-black">Last Sign In</Text>
            </View>
            <View className="flex-row justify-between py-4">
              <Text className="font-opensans text-uoft_grey_medium">
                Last Sign In:
              </Text>
              <Text className="font-opensans-medium">
                {admin.last_login
                  ? new Date(admin.last_login).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "Never"}
              </Text>
            </View>
          </View>

          {/* Notifications Section */}
          <View className="w-full bg-white p-4 px-6 rounded-sm">
            <View className="flex-row items-center gap-2">
              <Bell size={20} color="#000" />
              <Text className="text-black">Notifications</Text>
            </View>

            <View className="my-4 p-2 bg-uoft_grey_light items-center rounded-sm">
              <Text className="font-opensans">
                Manage Notification Preferences
              </Text>
            </View>
          </View>

          {/* Sign Out Button */}
          <Pressable
            className="bg-white p-2 px-6 rounded-sm flex-row items-center justify-center"
            onPress={signOut}
            android_ripple={null}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View>
              <Text className="text-red-500 items-center text-opensans">
                Sign Out
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
