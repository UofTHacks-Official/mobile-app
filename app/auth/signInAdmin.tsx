import { Ionicons } from "@expo/vector-icons";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { LoadingIndicator } from "../components/loading/loading";
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
  const [loading, setLoading] = useState(false);
  const [isFirstSignIn, setIsFirstSignIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn } = useAuth();

  // Animation values
  const buttonScale = useSharedValue(0.95);
  const buttonOpacity = useSharedValue(0.6);

  // Check if both fields are filled
  const isFormValid = email.trim() !== "" && password.trim() !== "";

  // Animate button when form validity changes
  useEffect(() => {
    if (isFormValid) {
      buttonScale.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.back(1.2)),
      });
      buttonOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
    } else {
      buttonScale.value = withTiming(0.95, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
      buttonOpacity.value = withTiming(0.6, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [isFormValid]);

  // Animated styles
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
      opacity: buttonOpacity.value,
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      buttonOpacity.value,
      [0.6, 1],
      ["#9CA3AF", "#002A5C"] // from grey to blue
    );

    return {
      backgroundColor,
    };
  });

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
    // Prevent submission if form is not valid
    if (!isFormValid) {
      return;
    }

    impactAsync(ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const { response, error } = await adminLogin(email, password);

      if (error) {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: "Invalid email or password. Please try again.",
        });
        setLoading(false);
        return;
      }

      if (!response || !response.data || !response.data.access_token) {
        console.log("No valid response, showing toast...");
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: "Something went wrong. Please try again.",
        });
        setLoading(false);
        return;
      }

      const { access_token, refresh_token } = response.data;
      console.log("authTokens:", access_token);
      console.log("refreshToken:", refresh_token);
      await signIn(access_token, refresh_token);

      if (isFirstSignIn) {
        await setSecureToken(FIRST_SIGN_SIGN_IN, "FALSE");
        router.replace("/auth/notification");
        setLoading(false);
      } else {
        // Add navigation for non-first sign in
        router.replace("/(admin)");
        setLoading(false);
      }
    } catch (e) {
      console.log("Catch block error:", e);
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "An unexpected error occurred. Please try again.",
      });
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 text-uoft_black pt-12">
        <View className="px-8 flex-col mt-6 mb-12">
          <Text className="text-2xl mb-4 font-semibold">Admin Sign In</Text>
          <Text className="text-lg  ">
            Sign in to access your Admin dashboard
          </Text>
        </View>

        <View className="space-y-4 px-8">
          <TextInput
            className="w-full px-4 bg-uoft_grey_lighter border-uoft_black py-3 text-lg mb-4 rounded-xl"
            placeholder="Email"
            placeholderTextColor="uoft_grey_medium"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            style={{
              minHeight: 50,
              textAlignVertical: "center",
              paddingTop: 4,
              paddingBottom: 4,
              lineHeight: 20,
            }}
          />

          <View className="relative">
            <TextInput
              className="w-full px-4 pr-12 bg-uoft_grey_lighter border-uoft_black py-3 text-lg mb-4 rounded-xl"
              placeholder="Password"
              placeholderTextColor="uoft_grey_medium"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
              style={{
                minHeight: 50,
                textAlignVertical: "center",
                paddingTop: 4,
                paddingBottom: 4,
                lineHeight: 20,
              }}
            />
            <Pressable
              onPress={togglePasswordVisibility}
              className="absolute right-4 top-0 bottom-4 justify-center"
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#666"
              />
            </Pressable>
          </View>
        </View>

        <Pressable onPress={handleSignIn} disabled={!isFormValid}>
          <Animated.View
            style={[animatedButtonStyle, animatedBackgroundStyle]}
            className="rounded-md py-4 mt-8 mx-8"
          >
            <Text className="text-center text-lg text-uoft_white">Sign In</Text>
          </Animated.View>
        </Pressable>

        {/* <Pressable onPress={handleSignIn}>
          <View className="border border-uoft_primary_blue rounded-md py-4 px-2 mt-4 mx-8">
            <Text className="text-uoft_primary_blue text-center text-lg">
              Forgot password
            </Text>
          </View>
        </Pressable> */}

        <View className="w-full px-12 absolute bottom-0 mb-8">
          <Text className="text-xs text-center text-gray-400">
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
