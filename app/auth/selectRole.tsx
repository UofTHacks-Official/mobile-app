import { useTheme } from "@/context/themeContext";
import { getThemeStyles, cn } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Gavel, Laptop, ShieldUser, Users } from "lucide-react-native";
import { Pressable, SafeAreaView, Text, View } from "react-native";

const SelectRole = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  
  const handleRoleSelection = (
    role: "Admin" | "Volunteer" | "Judge" | "Hacker"
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Here you would typically save the role selection to your auth state/context
    router.push(`/auth/signIn${role}` as any); // Navigate to the main app after role selection
  };

  const roles = [
    {
      name: "Admin",
      icon: ShieldUser,
      color: "bg-uoft_primary_blue",
      available: true,
    },
    {
      name: "Volunteer",
      icon: Users,
      color: "bg-uoft_accent_purple",
      available: false,
    },
    {
      name: "Judge",
      icon: Gavel,
      color: "bg-uoft__orange",
      available: false,
    },
    {
      name: "Hacker",
      icon: Laptop,
      color: "bg-uoft_accent_red",
      available: false,
    },
  ];

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className={cn("flex-1 px-6", themeStyles.primaryText)}>
        <Text className={cn("text-3xl mt-24 text-center font-['PPObjectSans-Heavy']", themeStyles.primaryText)}>
          Select your role
        </Text>
        <Text className={cn("text-md font-pp text-center mt-4", themeStyles.secondaryText)}>
          Choose how you&apos;ll be using the app
        </Text>

        <View className="mt-8 flex-1">
          <View className="flex-row justify-center mb-4">
            {roles.slice(0, 2).map((role) => {
              const IconComponent = role.icon;
              return (
                <Pressable
                  key={role.name}
                  className={`${
                    role.color
                  } w-[140px] h-[140px] items-center justify-center rounded-lg mx-2 ${
                    !role.available ? "opacity-50" : ""
                  }`}
                  android_ripple={null}
                  style={({ pressed }) => ({
                    opacity:
                      pressed && role.available
                        ? 0.8
                        : role.available
                        ? 1
                        : 0.5,
                  })}
                  onPress={() =>
                    role.available && handleRoleSelection(role.name as any)
                  }
                >
                  <IconComponent size={40} color="white" />
                  <Text className="text-uoft_white text-center font-pp text-base font-bold mt-2">
                    {role.name}
                  </Text>
                  {!role.available && (
                    <Text className="text-uoft_white text-center font-pp text-xs mt-1">
                      Coming Soon
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row justify-center">
            {roles.slice(2, 4).map((role) => {
              const IconComponent = role.icon;
              return (
                <Pressable
                  key={role.name}
                  className={`${
                    role.color
                  } w-[140px] h-[140px] items-center justify-center rounded-lg mx-2 ${
                    !role.available ? "opacity-50" : ""
                  }`}
                  android_ripple={null}
                  style={({ pressed }) => ({
                    opacity:
                      pressed && role.available
                        ? 0.8
                        : role.available
                        ? 1
                        : 0.5,
                  })}
                  onPress={() =>
                    role.available && handleRoleSelection(role.name as any)
                  }
                >
                  <IconComponent size={40} color="white" />
                  <Text className="text-uoft_white text-center font-pp text-base font-bold mt-2">
                    {role.name}
                  </Text>
                  {!role.available && (
                    <Text className="text-uoft_white text-center font-pp text-xs mt-1">
                      Coming Soon
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SelectRole;
