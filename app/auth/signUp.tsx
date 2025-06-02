import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, Text, TextInput, View } from "react-native";

const SignUp = () => {
  const [email, setEmail] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-cloud">
      <View className="flex-1 text-black pt-12">
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
            className="w-full border-b border-gravel py-3 font-pp text-lg text-clementine  mb-1"
            placeholder="Email"
            placeholderTextColor="rock"
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
          <Pressable className="bg-gravel py-4 w-full mt-8">
            <Text
              className="text-snow text-center font-pp text-lg font-bold"
              onPress={() => {
                router.push("/auth/confirmSignIn");
                router.setParams({
                  email: email,
                });
              }}
            >
              Continue
            </Text>
          </Pressable>
          <View className="flex-row mt-3">
            <Text className="font-pp text-gravel">
              Already have an account?{" "}
            </Text>
            <Link href="/" asChild>
              <Pressable>
                <Text className="font-pp text-gravel underline">Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
        <View className="w-full px-12 absolute bottom-0 mb-8">
          <Text className="font-pp text-xs text-center">
            By signing up, you agree to Paytrie's Terms and Conditions and
            Privacy Statement, and iDenfy's Terms and Conditions and Privacy
            Statement. By providing your email, you consent to receiving
            communications from Paytrie. You can opt-out anytime.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;
