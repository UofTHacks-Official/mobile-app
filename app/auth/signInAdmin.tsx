import { CustomSplashScreen } from "@/components/loading/SplashScreen";
import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { useAdminLogin, useHackerLogin } from "@/queries/user";
import { useUserTypeStore } from "@/reducers/userType";

import { devError } from "@/utils/logger";
import { cn, getThemeStyles } from "@/utils/theme";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateRandomState,
} from "@/utils/pkce";
import { env } from "@/utils/config";
import { appleAuthToken, googleAuthToken } from "@/requests/hacker";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import * as AppleAuthentication from "expo-apple-authentication";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import GoogleLogo from "../../assets/images/icons/google-logo.svg";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

WebBrowser.maybeCompleteAuthSession();

// Use native View on web for better compatibility
const AnimatedView = Platform.OS === "web" ? View : Animated.View;

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

    haptics.impactAsync(ImpactFeedbackStyle.Medium);

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
    haptics.impactAsync(ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleGoogleSignIn = async () => {
    haptics.impactAsync(ImpactFeedbackStyle.Medium);

    try {
      // generate pkce params
      const verifier = await generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      const state = await generateRandomState();

      // store pkce verifier and state
      await SecureStore.setItemAsync("google_pkce_verifier", verifier);
      await SecureStore.setItemAsync("google_oauth_state", state);

      // build oauth url
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(
        {
          client_id: env.google.iosClientId,
          redirect_uri: env.google.redirectUri,
          response_type: "code",
          scope: "openid email profile",
          code_challenge: challenge,
          code_challenge_method: "S256",
          access_type: "offline",
          prompt: "consent",
          state,
        }
      ).toString()}`;

      // open browser for oauth
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        env.google.redirectUri
      );
      if (result.type === "success" && result.url) {
        try {
          // Parse the callback URL
          const url = new URL(result.url);
          const code = url.searchParams.get("code");
          const returnedState = url.searchParams.get("state");

          // Retrieve stored values from SecureStore
          const storedVerifier = await SecureStore.getItemAsync(
            "google_pkce_verifier"
          );
          const storedState =
            await SecureStore.getItemAsync("google_oauth_state");

          // Validate
          if (!code) {
            throw new Error("No authorization code received");
          }

          if (!storedVerifier) {
            throw new Error("Missing PKCE verifier");
          }

          if (!returnedState || returnedState !== storedState) {
            throw new Error("Invalid OAuth state");
          }

          // Exchange code for tokens
          const tokens = await googleAuthToken(
            code,
            storedVerifier,
            env.google.redirectUri
          );

          // Clean up stored values
          await SecureStore.deleteItemAsync("google_pkce_verifier");
          await SecureStore.deleteItemAsync("google_oauth_state");

          // Sign in the user
          await signIn(tokens.access_token, tokens.refresh_token);
          router.dismissAll();

          if (isFirstSignIn) {
            router.replace("/auth/onboarding");
          } else {
            router.replace("/(admin)");
          }

          Toast.show({
            type: "success",
            text1: "Welcome!",
            text2: "Successfully signed in with Google",
          });
        } catch (error) {
          devError("OAuth callback error:", error);
          Toast.show({
            type: "error",
            text1: "Sign-In Failed",
            text2:
              error instanceof Error
                ? error.message
                : "Unable to complete sign-in",
          });
        }
      }
    } catch (error) {
      devError("Google OAuth Error", error);
      Toast.show({
        type: "error",
        text1: "Google Sign-In Failed",
        text2: "Unable to sign in with Google. Please try again.",
      });
    }
  };

  const handleAppleSignIn = async () => {
    haptics.impactAsync(ImpactFeedbackStyle.Medium);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Extract identity token
      const { identityToken, fullName } = credential;

      if (!identityToken) {
        throw new Error("No identity token received from Apple");
      }

      // Prepare user data (only provided on first sign-in)
      const userData = fullName
        ? {
            firstName: fullName.givenName || undefined,
            lastName: fullName.familyName || undefined,
          }
        : undefined;

      // Exchange token for app tokens
      const tokens = await appleAuthToken(identityToken, userData);

      // Sign in the user
      await signIn(tokens.access_token, tokens.refresh_token);
      router.dismissAll();

      if (isFirstSignIn) {
        router.replace("/auth/onboarding");
      } else {
        router.replace("/(admin)");
      }

      Toast.show({
        type: "success",
        text1: "Welcome!",
        text2: "Successfully signed in with Apple",
      });
    } catch (error: any) {
      if (error.code === "ERR_REQUEST_CANCELED") {
        // User canceled - do nothing
        return;
      }

      devError("Apple Sign In error:", error);
      Toast.show({
        type: "error",
        text1: "Apple Sign-In Failed",
        text2:
          error instanceof Error
            ? error.message
            : "Unable to sign in with Apple",
      });
    }
  };

  if (loginMutation.isPending) {
    return <CustomSplashScreen />;
  }

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            <AnimatedView
              style={
                Platform.OS === "web"
                  ? {
                      backgroundColor: isFormValid
                        ? isDark
                          ? "#75EDEF"
                          : "#132B38"
                        : "#9CA3AF",
                      opacity: isFormValid ? 1 : 0.6,
                    }
                  : [animatedButtonStyle, animatedBackgroundStyle]
              }
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
            </AnimatedView>
          </Pressable>

          <View className="flex-row items-center px-8 my-6">
            <View
              className={cn(
                "flex-1 h-px",
                isDark ? "bg-gray-700" : "bg-gray-300"
              )}
            />
            <Text className={cn("mx-4 text-sm", themeStyles.secondaryText)}>
              or
            </Text>
            <View
              className={cn(
                "flex-1 h-px",
                isDark ? "bg-gray-700" : "bg-gray-300"
              )}
            />
          </View>

          {/* Google OAuth Button - Only show for hackers */}
          {displayRole === "hacker" && (
            <Pressable
              onPress={handleGoogleSignIn}
              className={cn(
                "mx-8 py-4 rounded-md flex-row items-center justify-center mb-4",
                isDark ? "bg-gray-800" : "bg-gray-100"
              )}
            >
              <GoogleLogo width={20} height={20} />
              <Text
                className={cn(
                  "text-lg font-semibold ml-3",
                  themeStyles.primaryText
                )}
              >
                Continue with Google
              </Text>
            </Pressable>
          )}
          {/* Apple Sign In Button - Only show on iOS for hackers */}
          {displayRole === "hacker" && Platform.OS === "ios" && (
            <View className="mx-8 mb-4">
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                }
                buttonStyle={
                  isDark
                    ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                    : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={8}
                style={{
                  width: "100%",
                  height: 50,
                }}
                onPress={handleAppleSignIn}
              />
            </View>
          )}

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
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default SignInAdmin;
