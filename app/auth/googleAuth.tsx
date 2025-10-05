import { CustomSplashScreen } from "@/components/loading/SplashScreen";
import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { useGoogleAuthHacker } from "@/queries/user";
import { cn, getThemeStyles } from "@/utils/theme";
import * as AuthSession from "expo-auth-session";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import Toast from "react-native-toast-message";

const GoogleAuth = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const { signIn, isFirstSignIn } = useAuth();
  const googleAuthMutation = useGoogleAuthHacker();
  const redirectUri = "https://auth.expo.io/@uofthacks/uoft-hacks";

  console.log("Redirect URI:", redirectUri);

  const [codeVerifier, setCodeVerifier] = useState<string>("");

  const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
      scopes: ["openid", "profile", "email"],
      redirectUri,
      extraParams: {
        access_type: "offline",
      },
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    if (request?.codeVerifier) {
      setCodeVerifier(request.codeVerifier);
    }
  }, [request]);

  const handleAuthCode = useCallback(
    async (code: string) => {
      try {
        const result = await googleAuthMutation.mutateAsync({
          code,
          code_verifier: codeVerifier,
        });

        const { access_token, refresh_token } = result;

        await signIn(access_token, refresh_token);
        router.dismissAll();

        if (isFirstSignIn) {
          router.replace("/auth/onboarding");
        } else {
          router.replace("/landing");
        }
      } catch (error: any) {
        console.error("Google Auth Error:", error);
        Toast.show({
          type: "error",
          text1: "Authentication Failed",
          text2: "Failed to authenticate with Google. Please try again.",
        });
      }
    },
    [codeVerifier, googleAuthMutation, signIn, isFirstSignIn]
  );

  useEffect(() => {
    if (response?.type === "success" && response.params.code) {
      handleAuthCode(response.params.code);
    } else if (response?.type === "error") {
      Toast.show({
        type: "error",
        text1: "Authentication Failed",
        text2: response.error?.description || "Google authentication failed",
      });
    }
  }, [response, handleAuthCode]);

  const handleGoogleSignIn = async () => {
    try {
      impactAsync(ImpactFeedbackStyle.Medium);
      await promptAsync();
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      Toast.show({
        type: "error",
        text1: "Authentication Failed",
        text2: "Failed to start Google authentication.",
      });
    }
  };

  const handleGoBack = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    router.back();
  };

  if (googleAuthMutation.isPending) {
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
            Hacker Sign In
          </Text>
          <Text className={cn("text-lg", themeStyles.secondaryText)}>
            Sign in with your Google account to access your hacker dashboard
          </Text>
        </View>

        <View className="flex-1 justify-center px-8">
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={googleAuthMutation.isPending}
            className={cn(
              "w-full flex-row items-center justify-center py-4 px-6 rounded-xl border border-gray-300",
              themeStyles.lightCardBackground
            )}
          >
            <Image
              source={{
                uri: "https://developers.google.com/identity/images/g-logo.png",
              }}
              className="w-5 h-5 mr-3"
              resizeMode="contain"
            />
            <Text
              className={cn("text-lg font-medium", themeStyles.primaryText)}
            >
              {googleAuthMutation.isPending
                ? "Signing in..."
                : "Continue with Google"}
            </Text>
          </Pressable>
        </View>

        <View className="w-full px-8 absolute bottom-0 mb-8">
          <Text
            className={cn("text-xs text-center", themeStyles.secondaryText)}
          >
            By signing in, you agree to UofT Hacks&apos;{" "}
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

export default GoogleAuth;
