import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { useAuth } from "../context/authContext";
import { adminLogin } from "../requests/admin";
import {
  FIRST_SIGN_SIGN_IN,
  getSecureToken,
  setSecureToken,
} from "../utils/tokens/secureStorage";

const SignInAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState("false");
  const [isFirstSignIn, setIsFirstSignIn] = useState(false);

  const { signIn } = useAuth();

  useEffect(() => {
    const loadFirstSignIn = async () => {
      const firstTime = await getSecureToken(FIRST_SIGN_SIGN_IN);
      if (firstTime === null) {
        setIsFirstSignIn(true);
      }
    };
    loadFirstSignIn();
  }, []);

  const handleSignIn = async () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    try {
      const { response } = await adminLogin(email, password);
      if (!response) {
        return;
      }

      const { access_token, refresh_token } = response.data;
      console.log("authTokens:", access_token);
      console.log("refreshToken:", refresh_token);
      await signIn(access_token, refresh_token);

      if (isFirstSignIn) {
        await setSecureToken(FIRST_SIGN_SIGN_IN, "FALSE");
        router.replace("/auth/notification");
      } else {
        router.replace("/(admin)");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 text-uoft_black pt-12">
        <View className="px-8 flex-col mt-36 mb-12">
          <Text className="text-2xl mb-4">Admin Sign In</Text>
          <Text className="text-lg font-pp">
            Sign in to access your Admin dashboard
          </Text>
        </View>

        <View className="space-y-4 px-8">
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

        <Pressable onPress={handleSignIn}>
          <View className="bg-uoft_primary_blue rounded-md py-4 mt-8 mx-8">
            <Text className="text-uoft_white text-center font-pp text-lg font-bold">
              Sign In
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={handleSignIn}>
          <View className="border border-uoft_primary_blue rounded-md py-4 px-2 mt-4 mx-8">
            <Text className="text-uoft_primary_blue text-center font-pp text-lg font-bold">
              Forgot password
            </Text>
          </View>
        </Pressable>

        <View className="w-full px-12 absolute bottom-0 mb-8">
          <Text className="font-pp text-xs text-center">
            By signing in, you agree to our{" "}
            <Text
              style={{ textDecorationLine: "underline", color: "#002A5C" }}
              onPress={() => {}}
            >
              Terms and Conditions
            </Text>{" "}
            and{" "}
            <Text
              style={{ textDecorationLine: "underline", color: "#002A5C" }}
              onPress={() => {}}
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignInAdmin;
