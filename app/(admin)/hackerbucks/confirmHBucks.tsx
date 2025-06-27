import { useHackerBucksStore } from "@/app/reducers/hackerbucks";
import shortenString from "@/app/utils/tokens/format/shorten";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

export default function ConfirmHBucks() {
  const router = useRouter();

  const hackerBucksTransaction = useHackerBucksStore();

  const currentRecipient = hackerBucksTransaction.currentTransaction?.recipient;

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      router.push("/hackerbucks/success");
    } catch (error) {
      console.error("Transaction error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 flex flex-col">
        <View className="flex-1 px-6 py-4">
          <View>
            <MaterialCommunityIcons
              name="chevron-left"
              size={36}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.back();
              }}
            />
          </View>
          <View className="px py-4">
            <Text className="text-3xl font-pp font-semibold">
              +{hackerBucksTransaction.currentTransaction?.amount} HB
            </Text>
          </View>

          <View className="flex flex-col gap-4 bg-uoft_grey_lighter p-4 rounded-lg">
            <View className="flex flex-row justify-between items-center">
              <Text className="text-gray-600">Recipient</Text>
              <Text className="font-medium">
                {currentRecipient?.firstName} {currentRecipient?.lastName}
              </Text>
            </View>
            <View className="h-0.5 bg-gray-200 rounded-full" />
            <View className="flex flex-row justify-between items-center">
              <Text className="text-gray-600">Hacker ID</Text>
              <Text className="font-medium">
                {shortenString(currentRecipient?.id!)}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 mb-20">
          <TouchableOpacity
            className="bg-uoft_primary_blue py-4 rounded-lg items-center"
            onPress={handleConfirm}
          >
            <Text className="text-white text-lg">Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
