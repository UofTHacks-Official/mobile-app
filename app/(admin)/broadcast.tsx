import { useTheme } from "@/context/themeContext";
import { broadcastNotification } from "@/requests/announcement";
import { UserType } from "@/types/announcement";
import { cn, getThemeStyles } from "@/utils/theme";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import { router } from "expo-router";
import { Send, X } from "lucide-react-native";
import { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { PlatformSafeArea } from "@/components/common/PlatformSafeArea";
import { useMutation } from "@tanstack/react-query";

const USER_TYPE_OPTIONS: { value: UserType; label: string }[] = [
  { value: "admin", label: "Admins" },
  { value: "hacker", label: "Hackers" },
  { value: "judge", label: "Judges" },
  { value: "volunteer", label: "Volunteers" },
];

const BroadcastNotification = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedUserTypes, setSelectedUserTypes] = useState<UserType[]>([]);

  const broadcastMutation = useMutation({
    mutationFn: broadcastNotification,
    onSuccess: () => {
      haptics.notificationAsync("success" as any);
      Alert.alert("Success", "Notification broadcast successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setTitle("");
            setBody("");
            setSelectedUserTypes([]);
            router.back();
          },
        },
      ]);
    },
    onError: (error: any) => {
      haptics.notificationAsync("error" as any);
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Failed to broadcast notification. Please try again."
      );
    },
  });

  const toggleUserType = (userType: UserType) => {
    haptics.impactAsync(ImpactFeedbackStyle.Light);
    setSelectedUserTypes((prev) =>
      prev.includes(userType)
        ? prev.filter((type) => type !== userType)
        : [...prev, userType]
    );
  };

  const handleBroadcast = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a notification title");
      return;
    }
    if (!body.trim()) {
      Alert.alert("Error", "Please enter a notification message");
      return;
    }
    if (selectedUserTypes.length === 0) {
      Alert.alert("Error", "Please select at least one user type");
      return;
    }

    haptics.impactAsync(ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Confirm Broadcast",
      `Send notification to ${selectedUserTypes.join(", ")}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Send",
          style: "default",
          onPress: () => {
            broadcastMutation.mutate({
              title: title.trim(),
              body: body.trim(),
              user_types: selectedUserTypes,
            });
          },
        },
      ]
    );
  };

  return (
    <PlatformSafeArea className={cn("flex-1", themeStyles.background)}>
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mt-6 mb-8">
          <Text
            className={cn("text-3xl font-onest-bold", themeStyles.primaryText)}
          >
            Broadcast Notification
          </Text>
          <Pressable
            onPress={() => {
              haptics.impactAsync(ImpactFeedbackStyle.Light);
              router.back();
            }}
            className={cn(
              "w-10 h-10 rounded-full items-center justify-center",
              isDark ? "bg-[#303030]" : "bg-gray-100"
            )}
            android_ripple={null}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <X size={24} color={isDark ? "#FFFFFF" : "#000000"} />
          </Pressable>
        </View>

        {/* Title Input */}
        <View className="mb-6">
          <Text
            className={cn(
              "text-lg font-onest-bold mb-2",
              themeStyles.primaryText
            )}
          >
            Title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter notification title"
            placeholderTextColor={isDark ? "#666" : "#999"}
            className={cn(
              "px-4 py-3 rounded-xl font-pp text-base",
              isDark
                ? "bg-[#303030] text-white border border-gray-700"
                : "bg-white text-black border border-gray-200"
            )}
            maxLength={100}
          />
          <Text
            className={cn("text-xs mt-1 text-right", themeStyles.secondaryText)}
          >
            {title.length}/100
          </Text>
        </View>

        {/* Body Input */}
        <View className="mb-6">
          <Text
            className={cn(
              "text-lg font-onest-bold mb-2",
              themeStyles.primaryText
            )}
          >
            Message
          </Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Enter notification message"
            placeholderTextColor={isDark ? "#666" : "#999"}
            className={cn(
              "px-4 py-3 rounded-xl font-pp text-base",
              isDark
                ? "bg-[#303030] text-white border border-gray-700"
                : "bg-white text-black border border-gray-200"
            )}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text
            className={cn("text-xs mt-1 text-right", themeStyles.secondaryText)}
          >
            {body.length}/500
          </Text>
        </View>

        {/* User Types Selection */}
        <View className="mb-8">
          <Text
            className={cn(
              "text-lg font-onest-bold mb-3",
              themeStyles.primaryText
            )}
          >
            Send To
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {USER_TYPE_OPTIONS.map((option) => {
              const isSelected = selectedUserTypes.includes(option.value);
              return (
                <Pressable
                  key={option.value}
                  onPress={() => toggleUserType(option.value)}
                  className={cn(
                    "px-5 py-3 rounded-full border-2",
                    isSelected
                      ? "bg-uoft_primary_blue border-uoft_primary_blue"
                      : isDark
                        ? "bg-[#303030] border-gray-700"
                        : "bg-white border-gray-300"
                  )}
                  android_ripple={null}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    className={cn(
                      "font-onest-bold text-base",
                      isSelected ? "text-black" : themeStyles.primaryText
                    )}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Broadcast Button */}
        <Pressable
          onPress={handleBroadcast}
          disabled={broadcastMutation.isPending}
          className={cn(
            "py-4 px-6 rounded-xl items-center justify-center mb-8",
            broadcastMutation.isPending ? "bg-gray-400" : "bg-uoft_primary_blue"
          )}
          android_ripple={null}
          style={({ pressed }) => ({
            opacity: pressed && !broadcastMutation.isPending ? 0.8 : 1,
          })}
        >
          {broadcastMutation.isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Send size={20} color="#000" />
              <Text className="text-black text-lg font-onest-bold">
                Broadcast Notification
              </Text>
            </View>
          )}
        </Pressable>
      </ScrollView>
    </PlatformSafeArea>
  );
};

export default BroadcastNotification;
