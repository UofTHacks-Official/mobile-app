import { CustomSplashScreen } from "@/components/loading/SplashScreen";
import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { useAdminLogin, useHackerLogin } from "@/queries/user";
import { useUserTypeStore } from "@/reducers/userType";

import { devError } from "@/utils/logger";
import { cn, getThemeStyles } from "@/utils/theme";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const SignInAdmin = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const { userType } = useUserTypeStore();
  const { role } = useLocalSearchParams<{ role?: string }>();

  const displayRole = role || userType || "user";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, isFirstSignIn } = useAuth();
  const adminLoginMutation = useAdminLogin();
  const hackerLoginMutation = useHackerLogin();

  // Use hacker login for hackers, admin login for everyone else
  const loginMutation =
    displayRole === "hacker" ? hackerLoginMutation : adminLoginMutation;

  const roleTitle = "Sign In";
  const roleDescription = `Sign in to access your ${displayRole} dashboard`;

  // Animation values
  const buttonScale = useSharedValue(0.95);
  const buttonOpacity = useSharedValue(0.6);

  const isFormValid = email.trim() !== "" && password.trim() !== "";

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
  }, [isFormValid, buttonOpacity, buttonScale]);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
      opacity: buttonOpacity.value,
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const activeButtonColor = isDark ? "#75EDEF" : "#132B38";
    const backgroundColor = interpolateColor(
      buttonOpacity.value,
      [0.6, 1],
      ["#9CA3AF", activeButtonColor]
    );

    return {
      backgroundColor,
    };
  });

  const handleSignIn = async () => {
    if (!isFormValid) {
      return;
    }

    impactAsync(ImpactFeedbackStyle.Medium);

    try {
      const result = await loginMutation.mutateAsync({ email, password });
      const { access_token, refresh_token } = result;

      await signIn(access_token, refresh_token);
      router.dismissAll();

      if (isFirstSignIn) {
        router.replace("/auth/onboarding");
      } else {
        router.replace("/(admin)");
      }
    } catch (error) {
      devError("Error Loggin in", error);
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoBack = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    router.back();
  };

  if (loginMutation.isPending) {
    return <CustomSplashScreen />;
  }

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className={cn("flex-1 pt-12", themeStyles.primaryText)}>
        <Pressable onPress={handleGoBack} className="px-8">
          <ChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
        </Pressable>
        <View className="px-8 flex-col mt-6 mb-12">
          <Text
            className={cn(
              "text-2xl mb-4 font-semibold",
              themeStyles.primaryText
            )}
          >
            {roleTitle}
          </Text>
          <Text className={cn("text-lg", themeStyles.secondaryText)}>
            {roleDescription}
          </Text>
        </View>

        <View className="space-y-4 px-8">
          <TextInput
            className={cn(
              "w-full px-4 rounded-xl text-lg mb-4",
              themeStyles.lightCardBackground
            )}
            placeholder="Email"
            placeholderTextColor={isDark ? "#888" : "#666"}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            autoFocus={true}
            value={email}
            onChangeText={setEmail}
            onFocus={() => {}}
            onBlur={() => {}}
            style={{
              minHeight: 50,
              textAlignVertical: "center",
              paddingTop: 4,
              paddingBottom: 4,
              lineHeight: 20,
              color: isDark ? "#fff" : "#000",
            }}
          />

          <View
            className={cn(
              "w-full flex-row items-center px-4 rounded-xl mb-4",
              themeStyles.lightCardBackground
            )}
          >
            <TextInput
              className="flex-1 text-lg"
              placeholder="Password"
              placeholderTextColor={isDark ? "#888" : "#666"}
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
                color: isDark ? "#fff" : "#000",
              }}
            />
            <Pressable onPress={togglePasswordVisibility} className="ml-2">
              {showPassword ? (
                <Eye size={20} color={isDark ? "#fff" : "#000"} />
              ) : (
                <EyeOff size={20} color={isDark ? "#fff" : "#000"} />
              )}
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={handleSignIn}
          disabled={!isFormValid || loginMutation.isPending}
        >
          <Animated.View
            style={[animatedButtonStyle, animatedBackgroundStyle]}
            className={cn("py-4 mt-8 mx-8 rounded-md")}
          >
            <Text
              className={cn(
                "text-center text-lg font-semibold",
                themeStyles.primaryText1
              )}
            >
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </Text>
          </Animated.View>
        </Pressable>

        <View className="w-full px-12 absolute bottom-0 mb-8">
          <Text
            className={cn("text-xs text-center", themeStyles.secondaryText)}
          >
            By signing in, you agree to our{" "}
            <Text
              style={{ textDecorationLine: "underline" }}
              onPress={() => {}}
            >
              Terms and Conditions
            </Text>{" "}
            and{" "}
            <Text
              style={{ textDecorationLine: "underline" }}
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
