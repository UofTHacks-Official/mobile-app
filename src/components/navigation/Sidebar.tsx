import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { router, usePathname } from "expo-router";
import { Gavel, Users, LogOut } from "lucide-react-native";
import { Pressable, Text, View, Platform } from "react-native";
import { removeAuthTokens } from "@/utils/tokens/secureStorage";
import { useContext } from "react";
import { AuthContext } from "@/context/authContext";
import Toast from "react-native-toast-message";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  isDark: boolean;
  onPress: () => void;
}

const SidebarItem = ({
  icon,
  label,
  path,
  isActive,
  isDark,
  onPress,
}: SidebarItemProps) => {
  const themeStyles = getThemeStyles(isDark);

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center px-4 py-3 mx-2 rounded-lg mb-1",
        isActive && (isDark ? "bg-[#75EDEF]/20" : "bg-[#132B38]/20")
      )}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View className="mr-3">{icon}</View>
      <Text
        className={cn(
          "text-base font-medium",
          isActive
            ? isDark
              ? "text-[#75EDEF]"
              : "text-[#132B38]"
            : themeStyles.secondaryText
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export const Sidebar = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const pathname = usePathname();
  const authContext = useContext(AuthContext);

  const handleNavigation = (path: string) => {
    router.push(path as any);
  };

  const handleLogout = async () => {
    try {
      await removeAuthTokens();
      if (authContext?.signOut) {
        await authContext.signOut();
      }
      router.replace("/auth/selectRole");
      Toast.show({
        type: "success",
        text1: "Logged Out",
        text2: "You have been successfully logged out",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Logout Failed",
        text2: "Unable to log out. Please try again",
      });
    }
  };

  // Only render on web
  if (Platform.OS !== "web") {
    return null;
  }

  const iconColor = isDark ? "#888" : "#666";
  const activeIconColor = isDark ? "#75EDEF" : "#132B38";

  const navItems = [
    {
      icon: (
        <Gavel
          size={20}
          color={pathname === "/(admin)/judging" ? activeIconColor : iconColor}
        />
      ),
      label: "Judging",
      path: "/(admin)/judging",
    },
    {
      icon: (
        <Users
          size={20}
          color={pathname === "/(admin)/profiles" ? activeIconColor : iconColor}
        />
      ),
      label: "Profiles",
      path: "/(admin)/profiles",
    },
  ];

  return (
    <View
      className={cn(
        "w-64 h-full border-r",
        themeStyles.background,
        isDark ? "border-neutral-800" : "border-neutral-200"
      )}
    >
      {/* Header */}
      <View className="px-4 py-6 border-b border-neutral-800">
        <Text className={cn("text-2xl font-bold", themeStyles.primaryText)}>
          UofTHacks
        </Text>
        <Text className={cn("text-sm mt-1", themeStyles.secondaryText)}>
          Judge Portal
        </Text>
      </View>

      {/* Navigation Items */}
      <View className="flex-1 py-4">
        {navItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={pathname === item.path}
            isDark={isDark}
            onPress={() => handleNavigation(item.path)}
          />
        ))}
      </View>

      {/* Logout Button */}
      <View className="px-4 py-4 border-t border-neutral-800">
        <Pressable
          onPress={handleLogout}
          className={cn(
            "flex-row items-center px-4 py-3 rounded-lg",
            isDark ? "bg-red-500/10" : "bg-red-500/10"
          )}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-500 ml-3 font-medium">Logout</Text>
        </Pressable>
      </View>
    </View>
  );
};
