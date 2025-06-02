import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

const SignIn = () => {
  const { email } = useLocalSearchParams();
  const [showEmailPicker, setShowEmailPicker] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-cloud">
      <View className="flex-1 px-6 text-black">
        <Text className="text-3xl mt-24 text-center font-['PPObjectSans-Heavy']">
          Verify your email
        </Text>
        <View className="mt-48 text-center">
          <Text className="text-md font-pp text-center">
            We've sent a verification link to
          </Text>

          <Text className="text-md font-pp text-center">
            <Text className="font-['PPObjectSans-Bold']">{email}</Text> Please
            tap the
          </Text>

          <Text className="text-md font-pp text-center">
            link inside that email to continue.
          </Text>
        </View>
      </View>

      <View className="items-center space-y-4 mb-6 mt-auto pt-4 px-12">
        <Pressable
          className="bg-clementine py-4 px-6 w-full"
          android_ripple={null}
          style={({ pressed }) => ({
            opacity: 1,
          })}
          onPress={() => {
            setShowEmailPicker(true);
          }}
        >
          <Text className="text-snow text-center font-pp text-lg font-bold">
            Check my inbox
          </Text>
        </Pressable>
      </View>

      <View className="items-center space-y-4 mb-6 mt-auto px-12">
        <Pressable className="bg-gravel py-4 px-6 w-full">
          <Text
            className="text-snow text-center font-pp text-lg font-bold"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            Resend email
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;
