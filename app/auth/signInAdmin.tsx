import { router } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { adminLogin } from "../../requests/admin";
import { useAuth } from "../context/authContext";

const SignInAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useAuth();

  const handleSignIn = async () => {
    try {
      const { response } = await adminLogin(email, password);
      if (!response) {
        return;
      }

      const { access_token, refresh_token } = response.data;
      console.log("authTokens:", access_token);
      console.log("refreshToken:", refresh_token);
      await signIn(access_token, refresh_token);
      router.replace("/admin");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 text-uoft_black pt-12">
        <View className="px-12 flex-col mt-36 mb-12">
          <Text className="text-2xl font-['PPObjectSans-Heavy'] mb-4">
            Admin Sign In
          </Text>
          <Text className="text-lg font-pp">
            Sign in to access your Admin dashboard
          </Text>
        </View>

        <View className="space-y-4 px-12">
          <TextInput
            className="w-full border-b border-uoft_black py-3 font-pp text-lg text-uoft_secondary_orange mb-1"
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

          <TextInput
            className="w-full border-b border-uoft_black py-3 font-pp text-lg text-uoft_secondary_orange mb-1"
            placeholder="Password"
            placeholderTextColor="uoft_grey_medium"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
            style={{ minHeight: 50 }}
          />
        </View>

        <View className="w-full px-12">
          <Pressable
            className="bg-uoft_black py-4 w-full mt-8"
            onPress={handleSignIn}
          >
            <Text className="text-uoft_white text-center font-pp text-lg font-bold">
              Sign In
            </Text>
          </Pressable>
        </View>

        <View className="w-full px-12 absolute bottom-0 mb-8">
          <Text className="font-pp text-xs text-center">
            By signing in, you agree to our Terms and Conditions and Privacy
            Policy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignInAdmin;
