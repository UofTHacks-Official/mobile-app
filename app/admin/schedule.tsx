import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, SafeAreaView, Text, View } from "react-native";

const Schedule = () => {
  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 px-6 text-uoft_black">
        <View className="flex-row items-center mt-12 mb-6">
          <Pressable onPress={() => router.back()} className="mr-4">
            <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
          </Pressable>
          <Text className="text-2xl font-['PPObjectSans-Heavy']">Schedule</Text>
        </View>

        <View className="mt-6">
          <Text className="text-lg font-pp text-uoft_black">
            Coming soon: Schedule management features
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Schedule;
