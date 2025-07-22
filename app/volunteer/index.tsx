import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VolunteerScreen() {
  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-xl font-onest text-uoft_black">
          Volunteer Dashboard
        </Text>
        <Text className="text-base font-opensans text-gray-600 mt-2 text-center">
          This is the volunteer screen. Content coming soon.
        </Text>
      </View>
    </SafeAreaView>
  );
}
