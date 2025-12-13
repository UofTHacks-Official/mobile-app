import { FEATURE_FLAGS } from "@/config/featureFlags";
import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { useScrollNavBar } from "@/utils/navigation";
import { schedulePushNotification } from "@/utils/notifications";
import { cn, getThemeStyles } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  BellPlus,
  Route,
  ScanQrCode,
  AlertTriangle,
  Presentation,
  MapPin,
  Clock,
} from "lucide-react-native";
import { Calendar, MoneyWavy } from "phosphor-react-native";
import { useMemo, useEffect, useState } from "react";
import { Pressable, Text, View, ScrollView, Image } from "react-native";
import { getUserType, getJudgeId } from "@/utils/tokens/secureStorage";
import { SafeAreaView } from "react-native-safe-area-context";
import UoftDeerBlack from "../../assets/images/icons/uoft-deer-black.svg";
import UoftDeerWhite from "../../assets/images/icons/uoft-deer-white.svg";
import { useScheduleData } from "@/queries/schedule/schedule";
import { useCurrentTime } from "@/queries/schedule/currentTime";
import { useAnnouncementsData } from "@/queries/announcement/announcement";
import { useAllJudgingSchedules } from "@/queries/judging";

// Event type icons
const GoatSquare = require("../../assets/images/icons/goat-square.png");
const LionSquare = require("../../assets/images/icons/lion-square.png");
const AxSquare = require("../../assets/images/icons/ax-square.png");
const AppIcon = require("../../assets/images/icons/app-icon.png");

// Types
interface DashboardItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  backgroundColor: string;
  enabled: boolean;
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
    enabled: FEATURE_FLAGS.ENABLE_QR_SCANNER,
    route: "/(admin)/qr",
  },
  {
    id: "schedule",
    title: "Schedule",
    description: "Manage event schedules",
    icon: Calendar,
    backgroundColor: "bg-uoft_yellow",
    enabled: FEATURE_FLAGS.ENABLE_SCHEDULE,
    route: "/(admin)/schedule",
  },
  {
    id: "hacker-bucks",
    title: "Hacker Bucks",
    description: "Manage hacker bucks",
    icon: MoneyWavy,
    backgroundColor: "bg-uoft_accent_purple",
    enabled: FEATURE_FLAGS.ENABLE_HACKERBUCKS,
    route: "/hackerbucks",
  },
  {
    id: "notification",
    title: "Notification Example",
    description: "Send a notification from phone async",
    icon: BellPlus,
    backgroundColor: "bg-uoft_grey_light",
    enabled: FEATURE_FLAGS.ENABLE_NOTIFICATION_EXAMPLE,
    onPress: schedulePushNotification,
  },
  {
    id: "404-test",
    title: "404 Page Test",
    description: "Navigate to non-existent route",
    icon: AlertTriangle,
    backgroundColor: "bg-red-500",
    enabled: FEATURE_FLAGS.ENABLE_404_TEST,
    route: "/non-existent-route",
  },
  {
    id: "onboarding-test",
    title: "Test Onboarding",
    description: "View onboarding screens with progress bar",
    icon: Presentation,
    backgroundColor: "bg-uoft_yellow",
    enabled: FEATURE_FLAGS.ENABLE_ONBOARDING_TEST,
    route: "/auth/onboarding",
  },
];

// Components
const DashboardHeader = ({
  themeStyles,
  isDark,
}: {
  themeStyles: ReturnType<typeof getThemeStyles>;
  isDark: boolean;
}) => {
  return (
    <View className="mt-6">
      <View className="flex-row items-center gap-x-3">
        {isDark ? (
          <UoftDeerWhite width={40} height={40} />
        ) : (
          <UoftDeerBlack width={40} height={40} />
        )}
        <Text
          className={cn("text-3xl font-onest-bold", themeStyles.primaryText)}
        >
          Dashboard
        </Text>
      </View>
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

const DashboardGrid = ({ items }: { items: DashboardItem[] }) => {
  const enabledItems = items.filter((item) => item.enabled);

  return (
    <View className="mt-12 gap-y-6">
      {enabledItems.map((item) => (
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
};

const RecentAnnouncement = ({
  themeStyles,
  userType,
}: {
  themeStyles: ReturnType<typeof getThemeStyles>;
  userType: string | null;
}) => {
  // Fetch all announcements (skip for judges - they don't have access)
  const { data: announcements = [] } = useAnnouncementsData(
    userType !== "judge"
  );
  const { isDark } = useTheme();

  // Get the most recent announcement (API returns them sorted newest first)
  const recentAnnouncement = useMemo(() => {
    if (announcements.length === 0) return null;
    // API already returns sorted by newest first, just get the first one
    return announcements[0];
  }, [announcements]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!recentAnnouncement) {
    return null;
  }

  return (
    <View className="mt-4">
      <Text
        className={cn("text-2xl font-onest-bold mb-4", themeStyles.primaryText)}
      >
        Recent Announcement
      </Text>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          // Could navigate to announcements page or show full announcement
        }}
        className={cn("rounded-2xl p-4", isDark ? "bg-[#303030]" : "bg-white")}
        android_ripple={null}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: 3,
        })}
      >
        <View className="flex-row items-start gap-3">
          <Image
            source={AppIcon}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
            }}
            resizeMode="cover"
          />
          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-2">
              <Text
                className={cn(
                  "text-lg font-onest-bold flex-1",
                  themeStyles.primaryText
                )}
                numberOfLines={2}
              >
                {recentAnnouncement.title}
              </Text>
              <Text
                className={cn("text-xs ml-3", themeStyles.secondaryText)}
                style={{ opacity: 0.7 }}
              >
                {formatTimestamp(recentAnnouncement.created_at)}
              </Text>
            </View>
            <Text
              className={cn("text-sm leading-5", themeStyles.secondaryText)}
              numberOfLines={3}
            >
              {recentAnnouncement.content}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const UpcomingEvents = ({
  themeStyles,
  userType,
}: {
  themeStyles: ReturnType<typeof getThemeStyles>;
  userType: string | null;
}) => {
  const isJudge = userType === "judge";

  // Fetch hacker/admin schedules (skip for judges AND when userType is still loading)
  const { data: hackerSchedules = [] } = useScheduleData(
    ["activity", "networking", "food"],
    userType !== null && !isJudge
  );

  // Fetch judging schedules for judges (only when we know they're a judge)
  const { data: allJudgingSchedules = [] } = useAllJudgingSchedules(
    userType !== null && isJudge
  );
  const [judgeId, setJudgeId] = useState<number | null>(null);

  // Get judge ID for filtering
  useEffect(() => {
    if (isJudge) {
      const loadJudgeId = async () => {
        const id = await getJudgeId();
        setJudgeId(id);
      };
      loadJudgeId();
    }
  }, [isJudge]);

  // Get current time - updates every minute
  const currentTime = useCurrentTime();

  // Filter and sort to get 10 upcoming events
  const upcomingEvents = useMemo(() => {
    if (isJudge) {
      // For judges: combine all judging sessions into one event
      if (!judgeId) {
        console.log("[DEBUG] No judge ID yet");
        return [];
      }

      const judgeSchedules = allJudgingSchedules.filter(
        (s) => s.judge_id === judgeId
      );

      if (judgeSchedules.length === 0) {
        return [];
      }

      // Sort by timestamp to get earliest and latest times
      const sorted = [...judgeSchedules].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const firstSession = sorted[0];
      const lastSession = sorted[sorted.length - 1];
      const lastEndTime = new Date(
        new Date(lastSession.timestamp).getTime() + lastSession.duration * 60000
      );

      // Return a single combined event
      return [
        {
          id: "judging-sessions",
          title: `Judging Sessions (${judgeSchedules.length})`,
          startTime: firstSession.timestamp,
          endTime: lastEndTime.toISOString(),
          type: "activity" as const,
          location: firstSession.location,
          sessionCount: judgeSchedules.length,
        },
      ];
    } else {
      // For hackers/admins: show regular schedules
      return hackerSchedules
        .filter((schedule) => {
          const startTime = new Date(schedule.startTime);
          return startTime >= currentTime;
        })
        .sort((a, b) => {
          const aTime = new Date(a.startTime).getTime();
          const bTime = new Date(b.startTime).getTime();
          return aTime - bTime;
        })
        .slice(0, 10);
    }
  }, [isJudge, judgeId, allJudgingSchedules, hackerSchedules, currentTime]);

  const formatEventTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const formatTime = (date: Date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");
      return `${displayHours}:${displayMinutes} ${ampm}`;
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "food":
        return "#FFD54F";
      case "networking":
        return "#75EDEF";
      case "activity":
        return "#C8B6FF";
      default:
        return "#E0E0E0";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "food":
        return LionSquare;
      case "networking":
        return GoatSquare;
      case "activity":
        return AxSquare;
      default:
        return AxSquare;
    }
  };

  if (upcomingEvents.length === 0) {
    return null;
  }

  return (
    <View className="mt-8">
      <Text
        className={cn("text-2xl font-onest-bold mb-4", themeStyles.primaryText)}
      >
        Upcoming Events
      </Text>
      <View className="gap-y-3">
        {upcomingEvents.map((event) => (
          <Pressable
            key={event.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (isJudge) {
                // Navigate to judging schedule page for judges
                router.push("/(admin)/judging");
              } else {
                // Navigate to schedule detail for others
                router.push({
                  pathname: "/schedule-detail/[scheduleID]" as any,
                  params: {
                    scheduleID: event.id.toString(),
                  },
                });
              }
            }}
            className="flex-row items-center"
            android_ripple={null}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            {/* Square icon on the left */}
            <View
              className="w-20 h-20 rounded-lg items-center justify-center mr-4 overflow-hidden"
              style={{ backgroundColor: getEventTypeColor(event.type) }}
            >
              <Image
                source={getEventTypeIcon(event.type)}
                style={{ width: 80, height: 80 }}
                resizeMode="cover"
              />
            </View>

            {/* Event info stacked vertically */}
            <View className="flex-1">
              <Text
                className={cn(
                  "text-lg font-onest-bold mb-1",
                  themeStyles.primaryText
                )}
                numberOfLines={1}
              >
                {event.title}
              </Text>
              <View className="flex-row items-center gap-1 mb-0.5">
                <Clock
                  size={14}
                  color={
                    themeStyles.secondaryText === "text-gray-600"
                      ? "#666"
                      : "#A0A0A0"
                  }
                />
                <Text
                  className={cn("text-sm font-pp", themeStyles.secondaryText)}
                >
                  {formatEventDate(event.startTime)} •{" "}
                  {formatEventTime(event.startTime, event.endTime)}
                </Text>
              </View>
              {"location" in event && event.location && (
                <View className="flex-row items-center gap-1">
                  <MapPin
                    size={14}
                    color={
                      themeStyles.secondaryText === "text-gray-600"
                        ? "#666"
                        : "#A0A0A0"
                    }
                  />
                  <Text
                    className={cn("text-sm font-pp", themeStyles.secondaryText)}
                    numberOfLines={1}
                  >
                    {event.location}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

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
  const { hackerData } = useAuth();
  const { handleScroll } = useScrollNavBar();
  const [userType, setUserType] = useState<string | null>(null);

  // Get user type for conditional rendering
  useEffect(() => {
    const loadUserType = async () => {
      const type = await getUserType();
      setUserType(type);
    };
    loadUserType();
  }, []);

  // Filter dashboard items - hide onboarding test for hackers
  const dashboardItems = DASHBOARD_ITEMS.filter((item) => {
    if (item.id === "onboarding-test" && hackerData) {
      return false; // Hide onboarding test for hackers
    }
    return true;
  });

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <ScrollView
        className="flex-1 px-6"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <DashboardHeader themeStyles={themeStyles} isDark={isDark} />
        <DashboardGrid items={dashboardItems} />
        <RecentAnnouncement themeStyles={themeStyles} userType={userType} />
        <UpcomingEvents themeStyles={themeStyles} userType={userType} />
        {FEATURE_FLAGS.ENABLE_MODAL_TEST_WIDGET && <ModalTestWidget />}
        <View className="h-8" />
      </ScrollView>
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
