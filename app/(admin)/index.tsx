import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { schedulePushNotification } from "@/utils/notifications";
import { cn, getThemeStyles } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  BellPlus,
  Route,
  ScanQrCode,
  AlertTriangle,
} from "lucide-react-native";
import { Calendar, MoneyWavy, UserCircle } from "phosphor-react-native";
import { useCallback } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

// Types
interface DashboardItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  backgroundColor: string;
  route?: string;
  onPress?: () => void;
  params?: {
    scheduleID: string;
    schedule: string;
  };
}

// Constants
const DASHBOARD_ITEMS: DashboardItem[] = [
  {
    id: "qr-scan",
    title: "Scan QR Code",
    description: "Scan volunteer QR codes",
    icon: ScanQrCode,
    backgroundColor: "bg-uoft_primary_blue",
    route: "/(admin)/qr",
  },
  {
    id: "schedule",
    title: "Schedule",
    description: "Manage event schedules",
    icon: Calendar,
    backgroundColor: "bg-uoft_yellow",
    route: "/(admin)/schedule",
  },
  {
    id: "hacker-bucks",
    title: "Hacker Bucks",
    description: "Manage hacker bucks",
    icon: MoneyWavy,
    backgroundColor: "bg-uoft_accent_purple",
    route: "/hackerbucks",
  },
  {
    id: "notification",
    title: "Notification Example",
    description: "Send a notification from phone async",
    icon: BellPlus,
    backgroundColor: "bg-uoft_grey_light",
    onPress: schedulePushNotification,
  },
  {
    id: "404-test",
    title: "404 Page Test",
    description: "Navigate to non-existent route",
    icon: AlertTriangle,
    backgroundColor: "bg-red-500",
    route: "/non-existent-route",
  },
];

// Components
const DashboardHeader = ({
  onProfilePress,
  themeStyles,
}: {
  onProfilePress: () => void;
  themeStyles: ReturnType<typeof getThemeStyles>;
}) => {
  const { adminData } = useAuth();

  return (
    <View className="mt-6 flex-row items-center justify-between">
      <View>
        <Text
          className={cn("text-3xl font-onest-bold", themeStyles.primaryText)}
        >
          {adminData?.admin_role
            ? adminData.admin_role.charAt(0).toUpperCase() +
              adminData.admin_role.slice(1) +
              " "
            : ""}
          Dashboard
        </Text>
      </View>
      <Pressable onPress={onProfilePress} className="p-2">
        <UserCircle size={32} color={themeStyles.iconColor} />
      </Pressable>
    </View>
  );
};

const DashboardCard = ({
  item,
  onPress,
}: {
  item: DashboardItem;
  onPress: () => void;
}) => {
  const IconComponent = item.icon;

  return (
    <Pressable
      className={`${item.backgroundColor} p-6 rounded-lg flex-row items-center shadow-sm`}
      onPress={onPress}
      android_ripple={null}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <IconComponent size={32} color="black" />
      <View className="flex-1 ml-2">
        <Text className="text-black text-xl font-['PPObjectSans-Bold']">
          {item.title}
        </Text>
        <Text className="text-black/80 font-pp">{item.description}</Text>
      </View>
    </Pressable>
  );
};

const DashboardGrid = ({ items }: { items: DashboardItem[] }) => (
  <View className="mt-12 gap-y-6">
    {items.map((item) => (
      <DashboardCard
        key={item.id}
        item={item}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          if (item.onPress) {
            item.onPress();
          } else if (item.route) {
            router.push(item.route as any);
          }
        }}
      />
    ))}
  </View>
);

const ModalTestWidget = () => {
  const handleModalTestPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/schedule-detail/[scheduleID]" as any,
      params: {
        scheduleID: "2",
      },
    });
  };

  return (
    <View className="mt-8 p-4 bg-uoft_primary_blue rounded-lg">
      <View className="flex-row items-center mb-3">
        <Route size={24} color="black" />
        <Text className="text-black text-lg font-['PPObjectSans-Bold'] ml-2">
          Modal Test Widget
        </Text>
      </View>
      <Text className="text-black/80 font-pp mb-4">
        Testing the modal functionality with route parameters
      </Text>
      <Pressable
        onPress={handleModalTestPress}
        className="bg-white/20 p-3 rounded-lg self-start"
        android_ripple={null}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text className="text-black font-pp font-semibold">Test Modal</Text>
      </Pressable>
    </View>
  );
};

// Main Component
const AdminDashboard = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const handleProfilePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(admin)/profile");
  }, []);

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1 px-6">
        <DashboardHeader
          onProfilePress={handleProfilePress}
          themeStyles={themeStyles}
        />
        <DashboardGrid items={DASHBOARD_ITEMS} />
        <ModalTestWidget />
      </View>
      {/* <View className="items-center justify-center pb-8">
        <LottieView
          source={require("../../assets/lottie/moose.json")}
          autoPlay
          loop
          style={{ width: 180, height: 180 }}
        />
      </View> */}
    </SafeAreaView>
  );
};

export default AdminDashboard;
