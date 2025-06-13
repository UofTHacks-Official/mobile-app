import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NumericKeypad from "../../components/hacker_bucks/keyboard";

export interface Recipient {
  firstName: string;
  lastName: string;
  id: string;
}

export default function SwapScreen() {
  const [amount, setAmount] = useState("0");

  const [recipient, setRecipient] = useState<Recipient>({
    firstName: "Greg",
    lastName: "Heffley",
    id: "d7c2e8f1...b3d1e0a9c",
  });

  const handleKeyPress = (key: string) => {
    // Prevent multiple decimal points
    if (key === "." && amount.includes(".")) return;

    // If current value is "0", replace it with the new key
    if (amount === "0" && key !== ".") {
      setAmount(key);
    } else {
      setAmount(amount + key);
    }
  };

  const handleDelete = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount("0");
    }
  };

  const handlePresetAmount = (presetAmount: string) => {
    setAmount(presetAmount);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-uoft_dark_grey"
      edges={["top", "left", "right"]}
    >
      <View className="flex-1 px-4">
        <View className="flex-row items-center bg-uoft_light_grey px-6 py-4 min-h-[100px] rounded-lg">
          <View className="flex-1">
            <Text className="text-xl pt-2 font-pp">Sending</Text>
            <TextInput
              className="flex-1 font-pp text-4xl text-clementine border-0 p-0"
              placeholderTextColor="rock"
              keyboardType="numeric"
              autoCorrect={false}
              autoFocus={true}
              onChangeText={setAmount}
              value={amount}
              showSoftInputOnFocus={false}
            />
          </View>
        </View>

        <View className="absolute left-0 right-0 top-[85px] items-center z-10">
          <View className="bg-uoft_dark_grey p-1 rounded-lg">
            <MaterialCommunityIcons
              name="arrow-down"
              size={36}
              color="#666666"
            />
          </View>
        </View>

        <View className="flex-row items-center bg-uoft_light_grey rounded-lg px-6 py-4 min-h-[100px] mt-2 rounded-lg">
          <View className="flex-1">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 ml-2">
                <Text className="text-xl font-pp">Receiving</Text>
                <Text className="text-2xl text-gravel">
                  {recipient.firstName} {recipient.lastName}
                </Text>
                <Text className="text-sm text-uoft_grey_medium">
                  {recipient.id}
                </Text>
              </View>
              <Pressable className="text-sm text-center px-4 py-3 bg-uoft_dark_grey rounded-lg">
                <Text className="text-sm text-balck">Change</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <View className="mt-auto">
          <NumericKeypad
            onKeyPress={handleKeyPress}
            onDelete={handleDelete}
            onPresetAmount={handlePresetAmount}
          />
        </View>
        <View className="bg-uoft_primary_blue rounded-md items-center py-4 my-2 shadow-md">
          <Pressable
            onPress={() => {
              router.replace({
                pathname: "/admin/(hackerbucks)/confirmHBucks",
                params: {
                  recipient: JSON.stringify(recipient),
                  amount,
                },
              });
            }}
          >
            <Text className="text-white text-center text-lg font-pp">Send</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
