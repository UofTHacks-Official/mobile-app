import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Pressable, SafeAreaView, Text, View } from "react-native";

const SelectRole = () => {
  const handleRoleSelection = (role: "Admin" | "Volunteer") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Here you would typically save the role selection to your auth state/context
    router.push(`/auth/signIn${role}`); // Navigate to the main app after role selection
  };

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 px-6 text-uoft_black">
        <Text className="text-3xl mt-24 text-center font-['PPObjectSans-Heavy']">
          Select your role
        </Text>
        <Text className="text-md font-pp text-center mt-4">
          Choose how you'll be using the app
        </Text>

        <View className="mt-12 flex-row justify-center">
          <Pressable
            className="bg-uoft_secondary_orange w-[150px] h-[150px] items-center justify-center rounded-lg mr-4"
            android_ripple={null}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
            onPress={() => handleRoleSelection("Admin")}
          >
            <MaterialCommunityIcons
              name="shield-account"
              size={48}
              color="white"
            />
            <Text className="text-uoft_white text-center font-pp text-lg font-bold mt-2">
              Admin
            </Text>
          </Pressable>

          <Pressable
            className="bg-uoft_black w-[150px] h-[150px] items-center justify-center rounded-lg"
            android_ripple={null}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
            onPress={() => handleRoleSelection("Volunteer")}
          >
            <MaterialCommunityIcons
              name="account-group"
              size={48}
              color="white"
            />
            <Text className="text-uoft_white text-center font-pp text-lg font-bold mt-2">
              Volunteer
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SelectRole;
