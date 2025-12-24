import { useTheme } from "@/context/themeContext";
import { HackerTable } from "@/components/HackerTable";
import { cn, getThemeStyles } from "@/utils/theme";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfilesScreen = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const handleProfilePress = (hackerId: number) => {
    router.push(`/profile/${hackerId}` as any);
  };

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <HackerTable
        onProfilePress={handleProfilePress}
        enablePagination={true}
        itemsPerPage={10}
      />
    </SafeAreaView>
  );
};

export default ProfilesScreen;
