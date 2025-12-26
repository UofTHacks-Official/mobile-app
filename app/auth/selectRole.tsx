import { useTheme } from "@/context/themeContext";
import { useUserTypeStore } from "@/reducers/userType";
import { devLog } from "@/utils/logger";
import { cn, getThemeStyles } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgProps } from "react-native-svg";
import DeerIcon from "../../assets/images/icons/deer.svg";
import GoatIcon from "../../assets/images/icons/Goat.svg";
import HedIcon from "../../assets/images/icons/Hed.svg";
import OwlIcon from "../../assets/images/icons/owl.svg";

type RoleType = "Admin" | "Volunteer" | "Judge" | "Hacker";

interface Role {
  name: RoleType;
  icon: React.FC<SvgProps>;
  color: string;
  available: boolean;
  description: string;
}

interface RoleCardProps {
  role: Role;
  onPress: (roleName: RoleType) => void;
  isDark: boolean;
}

// Role Card Component
const RoleCard: React.FC<RoleCardProps> = ({ role, onPress }) => {
  const IconComponent = role.icon;

  return (
    <Pressable
      className={cn(
        "w-[160px] h-[160px] items-center justify-center rounded-xl mx-3",
        role.color,
        !role.available && "opacity-50"
      )}
      android_ripple={null}
      style={({ pressed }) => ({
        opacity: pressed && role.available ? 0.8 : role.available ? 1 : 0.5,
        transform: [{ scale: pressed && role.available ? 0.98 : 1 }],
      })}
      onPress={() => role.available && onPress(role.name)}
    >
      <IconComponent width={80} height={80} />

      <Text className="text-black text-center font-pp text-base font-bold mt-2">
        {role.name}
      </Text>

      {!role.available && (
        <Text className="text-black text-center font-pp text-xs mt-1 opacity-70">
          Coming Soon
        </Text>
      )}
    </Pressable>
  );
};

const Header: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const themeStyles = getThemeStyles(isDark);

  return (
    <View className="mt-24 mb-8">
      <Text
        className={cn(
          "text-3xl text-center font-semibold font-['PPObjectSans-Heavy'] mb-4",
          themeStyles.primaryText
        )}
      >
        Select your role
      </Text>
      <Text
        className={cn("font-pp text-center text-lg", themeStyles.secondaryText)}
      >
        Choose how you&apos;ll be using the app
      </Text>
    </View>
  );
};

// Footer Component
const Footer: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const themeStyles = getThemeStyles(isDark);

  return (
    <View className="mt-12 justify-center items-center">
      <Pressable className="py-4">
        <Text className={cn("underline text-lg", themeStyles.secondaryText2)}>
          What role am I?
        </Text>
      </Pressable>
    </View>
  );
};

const SelectRole = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const { setUserType } = useUserTypeStore();

  const handleRoleSelection = (role: RoleType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    switch (role) {
      case "Admin":
        setUserType("admin");
        router.navigate(`/auth/signInAdmin?role=admin`);
        break;
      case "Volunteer":
        setUserType("volunteer");
        router.navigate(`/auth/signInAdmin?role=volunteer`);
        break;
      case "Judge":
        setUserType("judge");
        router.navigate(`/auth/signInJudge`);
        break;
      case "Hacker":
        setUserType("hacker");
        router.navigate(`/auth/signInAdmin?role=hacker`);
        break;
    }
    devLog("Selected role: ", role);
  };

  const roles: Role[] = [
    {
      name: "Admin",
      icon: DeerIcon,
      color: "bg-uoft_primary_blue",
      available: true,
      description: "Manage events and oversee operations",
    },
    {
      name: "Volunteer",
      icon: HedIcon,
      color: "bg-uoft_accent_purple",
      available: true,
      description: "Help with event coordination and support",
    },
    {
      name: "Judge",
      icon: GoatIcon,
      color: "bg-uoft__orange",
      available: true,
      description: "Evaluate and score hackathon projects",
    },
    {
      name: "Hacker",
      icon: OwlIcon,
      color: "bg-uoft_accent_red",
      available: true,
      description: "Participate in the hackathon",
    },
  ];

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1 px-6">
        <Header isDark={isDark} />

        <View className="flex-1 justify-start">
          {/* Top Row */}
          <View className="flex-row justify-center mb-8">
            {roles.slice(0, 2).map((role) => (
              <RoleCard
                key={role.name}
                role={role}
                onPress={handleRoleSelection}
                isDark={isDark}
              />
            ))}
          </View>

          {/* Bottom Row */}
          <View className="flex-row justify-center">
            {roles.slice(2, 4).map((role) => (
              <RoleCard
                key={role.name}
                role={role}
                onPress={handleRoleSelection}
                isDark={isDark}
              />
            ))}
          </View>
        </View>

        <Footer isDark={isDark} />
      </View>
    </SafeAreaView>
  );
};

export default SelectRole;
