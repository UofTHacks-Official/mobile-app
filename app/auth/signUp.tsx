import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SignUp = () => {
  const [email, setEmail] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 text-uoft_black pt-12">
        <View className="px-12 flex-col mt-36 mb-12">
          <Text className="text-2xl font-['PPObjectSans-Heavy'] mb-4">
            Sign up
          </Text>
          <Text className="text-lg font-pp">
            Enter your email associated with your Interac profile
          </Text>
        </View>

        <View className="space-y-2 flex-row items-center px-12">
          <TextInput
            className="w-full border-b border-uoft_black py-3 font-pp text-lg text-uoft__orange  mb-1"
            placeholder="Email"
            placeholderTextColor="uoft_grey_medium"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            style={{ minHeight: 50 }}
          />
        </View>
        <View className="w-full px-12 ">
          <Pressable className="bg-uoft_black py-4 w-full mt-8">
            <Text
              className="text-uoft_white text-center font-pp text-lg font-bold"
              onPress={() => {
                router.push({
                  pathname: "/auth/confirmSignIn" as any,
                  params: { email: email },
                });
              }}
            >
              Continue
            </Text>
          </Pressable>
          <View className="flex-row mt-3">
            <Text className="font-pp text-uoft_black">
              Already have an account?{" "}
            </Text>
            <Link href="/" asChild>
              <Pressable>
                <Text className="font-pp text-uoft_black underline">
                  Sign in
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
        <View className="w-full px-12 absolute bottom-0 mb-8">
          <Text className="font-pp text-xs text-center">
            By signing up, you agree to Paytrie&apos;s Terms and Conditions and
            Privacy Statement.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;
