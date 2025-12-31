import { FEATURE_FLAGS } from "@/config/featureFlags";
import { useAuth } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { useHackerBucksStore } from "@/reducers/hackerbucks";
import { useScrollNavBar } from "@/utils/navigation";
import { schedulePushNotification } from "@/utils/notifications";
import { cn, getThemeStyles } from "@/utils/theme";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import { router } from "expo-router";
import {
  BellPlus,
  Route,
  ScanQrCode,
  AlertTriangle,
  Presentation,
  MapPin,
  Clock,
  BanknoteArrowUp,
  BanknoteArrowDown,
  UserCheck,
  Coins,
} from "lucide-react-native";
import { Calendar, MoneyWavy } from "phosphor-react-native";
import { useMemo, useEffect, useState } from "react";
import { Pressable, Text, View, ScrollView, Image } from "react-native";
import {
  getUserType,
  getJudgeId,
  getSponsorPin,
} from "@/utils/tokens/secureStorage";
import { SafeAreaView } from "react-native-safe-area-context";
import UoftDeerBlack from "../../assets/images/icons/uoft-deer-black.svg";
import UoftDeerWhite from "../../assets/images/icons/uoft-deer-white.svg";
import GoatIcon from "../../assets/images/icons/goat.png";
import { useScheduleData } from "@/queries/schedule/schedule";
import { useCurrentTime } from "@/queries/schedule/currentTime";
import { useAnnouncementsData } from "@/queries/announcement/announcement";
import { useJudgeSchedules } from "@/queries/judging";
import { useProjects } from "@/queries/project";

// Event type icons
const GoatSquare = require("../../assets/images/icons/goat-square.png");
const LionSquare = require("../../assets/images/icons/lion-square.png");
const AxSquare = require("../../assets/images/icons/ax-square.png");

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
  hackerData,
}: {
  themeStyles: ReturnType<typeof getThemeStyles>;
  isDark: boolean;
  hackerData: any;
}) => {
  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-x-3 flex-1">
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
        {hackerData && (
          <View
            className={cn(
              "flex-row items-center gap-x-2 px-3 py-2 rounded-full",
              isDark ? "bg-[#303030]" : "bg-gray-100"
            )}
          >
            <Coins size={18} color={isDark ? "#FFD700" : "#D4AF37"} />
            <Text
              className={cn(
                "text-base font-onest-bold",
                themeStyles.primaryText
              )}
            >
              {hackerData.hacker_bucks ?? 0}
            </Text>
          </View>
        )}
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
            haptics.impactAsync(ImpactFeedbackStyle.Medium);
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

const AdminActionButtons = ({
  themeStyles,
  isDark,
}: {
  themeStyles: ReturnType<typeof getThemeStyles>;
  isDark: boolean;
}) => {
  const {
    startTransaction,
    updateTransactionAmount,
    updateTransactionStatus,
    clearTransaction,
  } = useHackerBucksStore();

  const handleCheckIn = () => {
    haptics.impactAsync(ImpactFeedbackStyle.Medium);
    router.push("/hackerbucks/scan?mode=checkin");
  };

  const handleAddBucks = () => {
    haptics.impactAsync(ImpactFeedbackStyle.Medium);
    router.push("/hackerbucks/scan?mode=add");
  };

  const handleDeductBucks = () => {
    haptics.impactAsync(ImpactFeedbackStyle.Medium);
    router.push("/hackerbucks/scan?mode=deduct");
  };

  const handlePreviewResult = (status: "completed" | "failed") => {
    haptics.impactAsync(ImpactFeedbackStyle.Medium);
    clearTransaction();
    startTransaction(
      {
        firstName: "Alex",
        lastName: "Hacker",
        id: "TEST123",
        email: "alex@uofthacks.com",
      },
      "250",
      "TEST123"
    );
    updateTransactionAmount("250", "send");
    updateTransactionStatus(status);
    router.push("/hackerbucks/success");
  };

  return (
    <View className="mt-6">
      <View className="flex-row gap-3">
        <Pressable
          onPress={handleCheckIn}
          className="flex-1"
          android_ripple={null}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View
            className="rounded-xl p-4 items-center justify-center"
            style={{ backgroundColor: "#75EDEF" }}
          >
            <UserCheck size={24} color="#000" style={{ marginBottom: 6 }} />
            <Text className="text-sm font-semibold text-center text-black">
              Check In Hacker
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={handleAddBucks}
          className="flex-1"
          android_ripple={null}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View
            className="rounded-xl p-4 items-center justify-center"
            style={{ backgroundColor: "#F17AAD" }}
          >
            <BanknoteArrowUp
              size={24}
              color="#000"
              style={{ marginBottom: 6 }}
            />
            <Text className="text-sm font-semibold text-center text-black">
              Add HackerBux
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={handleDeductBucks}
          className="flex-1"
          android_ripple={null}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View
            className="rounded-xl p-4 items-center justify-center"
            style={{ backgroundColor: "#FFDD80" }}
          >
            <BanknoteArrowDown
              size={24}
              color="#000"
              style={{ marginBottom: 6 }}
            />
            <Text className="text-sm font-semibold text-center text-black">
              Deduct HackerBux
            </Text>
          </View>
        </Pressable>
      </View>
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
  // Fetch announcements filtered by user type
  // Only enable when userType is resolved
  const { data: announcements = [] } = useAnnouncementsData(
    userType as "admin" | "hacker" | "judge" | null
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
    <View className="3">
      <Text
        className={cn("text-2xl font-onest-bold mb-4", themeStyles.primaryText)}
      >
        Recent Announcement
      </Text>
      <Pressable
        onPress={() => {
          haptics.impactAsync(ImpactFeedbackStyle.Medium);
          // Could navigate to announcements page or show full announcement
        }}
        className={cn(
          "rounded-2xl p-4 border",
          isDark ? "bg-[#303030] border-gray-700" : "border-gray-200"
        )}
        android_ripple={null}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <View className="flex-row items-start gap-3">
          <Image source={GoatIcon} style={{ width: 48, height: 48 }} />
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
  const isVolunteer = userType === "volunteer";
  const [judgeId, setJudgeId] = useState<number | null>(null);
  const [pin, setPin] = useState<number | null>(null);

  // Get judge ID and PIN for filtering
  useEffect(() => {
    if (isJudge) {
      const loadData = async () => {
        const id = await getJudgeId();
        const sponsorPin = await getSponsorPin();
        setJudgeId(id);
        setPin(sponsorPin);
      };
      loadData();
    }
  }, [isJudge]);

  // Fetch hacker/admin schedules (skip for judges, volunteers, AND when userType is still loading)
  const { data: hackerSchedules = [] } = useScheduleData(
    ["activity", "networking", "food"],
    userType !== null && !isJudge && !isVolunteer
  );

  // Fetch judging schedules for judges using judge-specific endpoint
  const { data: judgeSchedules = [] } = useJudgeSchedules(
    judgeId,
    userType !== null && isJudge
  );

  // Fetch projects for judges to display project names
  const { data: projectsResponse } = useProjects(isJudge ? pin : null);

  // Create a map of teamId -> project for quick lookup
  const projectsMap = useMemo(() => {
    if (!projectsResponse?.projects) return new Map();
    return new Map(projectsResponse.projects.map((p) => [p.team_id, p]));
  }, [projectsResponse]);

  // Get current time - updates every minute
  const currentTime = useCurrentTime();

  // Filter and sort to get 10 upcoming events
  const upcomingEvents = useMemo(() => {
    if (isJudge) {
      // For judges: show individual judging sessions with project info
      if (!judgeSchedules || judgeSchedules.length === 0) {
        return [];
      }

      // Sort by timestamp
      const sorted = [...judgeSchedules].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Map each schedule to an event with project info
      return sorted.slice(0, 10).map((schedule) => {
        const project = projectsMap.get(schedule.team_id);
        const endTime = new Date(
          new Date(schedule.timestamp).getTime() + schedule.duration * 60000
        );

        return {
          id: schedule.judging_schedule_id.toString(),
          title: project?.project_name || `Project (Team #${schedule.team_id})`,
          startTime: schedule.timestamp,
          endTime: endTime.toISOString(),
          type: "activity" as const,
          location: schedule.location,
          teamId: schedule.team_id,
          scheduleId: schedule.judging_schedule_id,
        };
      });
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
  }, [isJudge, judgeSchedules, hackerSchedules, currentTime, projectsMap]);

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
              haptics.impactAsync(ImpactFeedbackStyle.Medium);
              if (isJudge && "teamId" in event && "scheduleId" in event) {
                // Navigate to specific project overview for judges
                router.push({
                  pathname: "/(judge)/projectOverview",
                  params: {
                    teamId: event.teamId,
                    scheduleId: event.scheduleId,
                  },
                });
              } else if (isJudge) {
                // Fallback: navigate to judging schedule page
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
            className="flex-row items-start"
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
    haptics.impactAsync(ImpactFeedbackStyle.Medium);
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
        <DashboardHeader
          themeStyles={themeStyles}
          isDark={isDark}
          hackerData={hackerData}
        />
        <DashboardGrid items={dashboardItems} />
        {userType && (
          <RecentAnnouncement themeStyles={themeStyles} userType={userType} />
        )}
        {FEATURE_FLAGS.ENABLE_HACKERBUCKS &&
          (userType === "admin" || userType === "volunteer") && (
            <AdminActionButtons themeStyles={themeStyles} isDark={isDark} />
          )}
        {FEATURE_FLAGS.ENABLE_TEST_QR_GENERATOR && userType === "admin" && (
          <View className="mt-4">
            <Pressable
              onPress={() => {
                haptics.impactAsync(ImpactFeedbackStyle.Medium);
                router.push("/(admin)/test-qr");
              }}
              className={cn(
                "py-3 px-4 rounded-xl",
                isDark ? "bg-[#303030]" : "bg-gray-200"
              )}
            >
              <Text
                className={cn(
                  "text-center text-sm font-pp",
                  themeStyles.primaryText
                )}
              >
                [TEST] Generate Test QR Code
              </Text>
            </Pressable>
          </View>
        )}
        {userType && (
          <UpcomingEvents themeStyles={themeStyles} userType={userType} />
        )}
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
