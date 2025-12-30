import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Bookmark } from "lucide-react-native";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { useFetchHackerById } from "@/queries/hacker";
import { ProfileDisplay } from "@/components/profile/ProfileDisplay";
import {
  useSaveHacker,
  useUnsaveHacker,
  useSavedHackers,
} from "@/queries/judge";
import { useState, useEffect } from "react";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import Toast from "react-native-toast-message";

const ProfileDetailPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const hackerId = Number(id);
  const {
    data: hacker,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchHackerById(hackerId);

  // Saved hacker state and hooks
  const [isSaved, setIsSaved] = useState(false);
  const { data: savedHackers } = useSavedHackers(1, 100);
  const saveHackerMutation = useSaveHacker();
  const unsaveHackerMutation = useUnsaveHacker();

  // Check if this hacker is saved
  useEffect(() => {
    if (savedHackers?.data) {
      const saved = savedHackers.data.some((h) => h.hacker_id === hackerId);
      setIsSaved(saved);
    }
  }, [savedHackers, hackerId]);

  const handleToggleSave = async () => {
    haptics.impactAsync(ImpactFeedbackStyle.Medium);

    try {
      if (isSaved) {
        await unsaveHackerMutation.mutateAsync(hackerId);
        setIsSaved(false);
        Toast.show({
          type: "success",
          text1: "Hacker Unsaved",
        });
      } else {
        await saveHackerMutation.mutateAsync(hackerId);
        setIsSaved(true);
        Toast.show({
          type: "success",
          text1: "Hacker Saved",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to Update",
        text2: "Could not update saved status",
      });
      console.error("Toggle save error:", error);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={isDark ? "#75EDEF" : "#132B38"}
          />
          <Text className={cn("mt-4 text-lg", themeStyles.primaryText)}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (isError || !hacker) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-400 text-lg mb-4">
            {isError ? "Failed to load profile" : "Profile not found"}
          </Text>
          {isError && error && (
            <Text className={cn("mb-6 text-center", themeStyles.secondaryText)}>
              {(error as Error)?.message || "An error occurred"}
            </Text>
          )}
          <View className="flex-row gap-4">
            <Pressable
              onPress={() => router.back()}
              className={cn(
                "px-6 py-3 rounded-xl",
                isDark ? "bg-neutral-700" : "bg-neutral-300"
              )}
            >
              <Text className={cn("font-semibold", themeStyles.primaryText)}>
                Go Back
              </Text>
            </Pressable>
            {isError && (
              <Pressable
                onPress={() => refetch()}
                className={cn(
                  "px-6 py-3 rounded-xl",
                  isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
                )}
              >
                <Text
                  className={cn(
                    "font-semibold",
                    isDark ? "text-black" : "text-white"
                  )}
                >
                  Try Again
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Success State
  return (
    <SafeAreaView
      className={cn("flex-1", themeStyles.background)}
      edges={["top"]}
    >
      {/* Header with Back Button and Save Button */}
      <View
        className={cn(
          "flex-row items-center justify-between px-6 py-4 border-b",
          isDark ? "border-neutral-800" : "border-neutral-200"
        )}
      >
        <View className="flex-row items-center flex-1">
          <Pressable onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color={isDark ? "#75EDEF" : "#132B38"} />
          </Pressable>
          <Text
            className={cn("text-xl font-semibold", themeStyles.primaryText)}
          >
            Hacker Profile
          </Text>
        </View>
        <Pressable
          onPress={handleToggleSave}
          className={cn(
            "p-2 rounded-lg",
            isSaved ? (isDark ? "bg-[#75EDEF]/20" : "bg-[#132B38]/10") : ""
          )}
        >
          <Bookmark
            size={24}
            color={
              isSaved
                ? isDark
                  ? "#75EDEF"
                  : "#132B38"
                : isDark
                  ? "#666"
                  : "#999"
            }
            fill={isSaved ? (isDark ? "#75EDEF" : "#132B38") : "transparent"}
          />
        </Pressable>
      </View>

      {/* Profile Content */}
      <ProfileDisplay hacker={hacker} />
    </SafeAreaView>
  );
};

export default ProfileDetailPage;
