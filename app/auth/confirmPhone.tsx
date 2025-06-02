import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { Pressable, SafeAreaView, Text, TextInput, View } from "react-native";

const ConfirmPhone = () => {
  // Create refs for each input
  const firstInput = useRef<TextInput>(null);
  const secondInput = useRef<TextInput>(null);
  const thirdInput = useRef<TextInput>(null);
  const fourthInput = useRef<TextInput>(null);

  // State to store the values
  const [code, setCode] = useState({
    1: "",
    2: "",
    3: "",
    4: "",
  });

  // Handle input changes
  const handleInput = (text: string, index: number) => {
    const newCode = { ...code, [index]: text };
    setCode(newCode);

    // Auto focus next input if there's a value
    if (text.length === 1) {
      switch (index) {
        case 1:
          secondInput.current?.focus();
          break;
        case 2:
          thirdInput.current?.focus();
          break;
        case 3:
          fourthInput.current?.focus();
          break;
        case 4:
          fourthInput.current?.blur();
          break;
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 text-uoft_black pt-12">
        <View className="px-12 flex-col mt-24 mb-12">
          <Text className="font-['PPObjectSans-Heavy'] text-2xl font-bold mb-4">
            Verify your phone number
          </Text>
        </View>

        <View className="space-y-2 flex-row items-center px-12">
          <View className="flex-row justify-between w-full">
            <TextInput
              ref={firstInput}
              className="w-[70px] h-[70px] border border-uoft_black rounded-lg font-pp text-2xl text-uoft_secondary_orange text-center"
              placeholderTextColor="uoft_grey_medium"
              keyboardType="numeric"
              maxLength={1}
              value={code[1]}
              onChangeText={(text) => handleInput(text, 1)}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={true}
            />
            <TextInput
              ref={secondInput}
              className="w-[70px] h-[70px] border border-uoft_black rounded-lg font-pp text-2xl text-uoft_secondary_orange text-center"
              placeholderTextColor="uoft_grey_medium"
              keyboardType="numeric"
              maxLength={1}
              value={code[2]}
              onChangeText={(text) => handleInput(text, 2)}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              ref={thirdInput}
              className="w-[70px] h-[70px] border border-uoft_black rounded-lg font-pp text-2xl text-uoft_secondary_orange text-center"
              placeholderTextColor="uoft_grey_medium"
              keyboardType="numeric"
              maxLength={1}
              value={code[3]}
              onChangeText={(text) => handleInput(text, 3)}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              ref={fourthInput}
              className="w-[70px] h-[70px] border border-uoft_black rounded-lg font-pp text-2xl text-uoft_secondary_orange text-center"
              placeholderTextColor="uoft_grey_medium"
              keyboardType="numeric"
              maxLength={1}
              value={code[4]}
              onChangeText={(text) => handleInput(text, 4)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
        <View className="w-full px-12 ">
          <Pressable className="bg-uoft_black py-4 w-full mt-8">
            <Text
              className="text-uoft_white text-center font-pp text-lg font-bold"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ConfirmPhone;
