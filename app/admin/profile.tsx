import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { useAuth } from "../../context/authContext";

const Profile = () => {
  const { signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-cloud">
      <View className="flex-1 px-6 text-black">
        <View className="mt-12">
          <Text className="text-3xl font-['PPObjectSans-Heavy'] mb-2">
            Profile
          </Text>
          <Text className="text-lg font-pp text-gravel">
            Manage your account settings
          </Text>
        </View>

        <View className="mt-12 space-y-6">
          <Pressable
            className="bg-gravel p-6 rounded-lg flex-row items-center"
            onPress={signOut}
            android_ripple={null}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <MaterialCommunityIcons
              name="logout"
              size={32}
              color="white"
              style={{ marginRight: 16 }}
            />
            <View>
              <Text className="text-snow text-xl font-['PPObjectSans-Bold']">
                Sign Out
              </Text>
              <Text className="text-snow/80 font-pp">
                Log out of your account
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
