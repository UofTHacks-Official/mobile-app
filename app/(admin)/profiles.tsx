import { useTheme } from "@/context/themeContext";
import { useFetchHackers } from "@/queries/hacker";
import type { HackerProfile } from "@/requests/hacker";
import { cn, getThemeStyles } from "@/utils/theme";
import { router } from "expo-router";
import { Search, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface HackerRowProps {
  hacker: HackerProfile;
  isDark: boolean;
  themeStyles: any;
}

const HackerRow = ({ hacker, isDark, themeStyles }: HackerRowProps) => {
  const handleViewProfile = () => {
    router.push(`/profile/${hacker.hacker_id}` as any);
  };

  return (
    <View
      className={cn(
        "flex-row border-b",
        isDark ? "border-neutral-800" : "border-neutral-200"
      )}
      style={{ minHeight: 60 }}
    >
      {/* Hacker Column */}
      <View
        className="flex-1 px-4 py-4 justify-center"
        style={{ minWidth: 200 }}
      >
        <View className="flex-row items-center">
          {/* Avatar */}
          <View className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 items-center justify-center mr-3">
            <Text className="text-white font-bold text-base">
              {hacker.hacker_fname[0]}
              {hacker.hacker_lname[0]}
            </Text>
          </View>
          {/* Name and Link */}
          <View className="flex-1">
            <Text className={cn("font-medium", themeStyles.primaryText)}>
              {hacker.hacker_fname} {hacker.hacker_lname}
            </Text>
            <Pressable onPress={handleViewProfile}>
              <Text className="text-blue-400 text-sm hover:underline">
                View Profile
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* School Column */}
      <View
        className="flex-1 px-4 py-4 justify-center"
        style={{ minWidth: 150 }}
      >
        <Text className={cn(themeStyles.secondaryText)}>
          {hacker.school || <Text className="text-neutral-500 text-sm">-</Text>}
        </Text>
      </View>

      {/* Major Column */}
      <View
        className="flex-1 px-4 py-4 justify-center"
        style={{ minWidth: 150 }}
      >
        <Text className={cn(themeStyles.secondaryText)}>
          {hacker.major || <Text className="text-neutral-500 text-sm">-</Text>}
        </Text>
      </View>

      {/* Skills Column */}
      <View
        className="flex-1 px-4 py-4 justify-center"
        style={{ minWidth: 180 }}
      >
        <View className="flex-row flex-wrap">
          {hacker.skills && hacker.skills.length > 0 ? (
            <>
              {hacker.skills.slice(0, 2).map((skill) => (
                <View
                  key={skill}
                  className="bg-cyan-400/20 px-2 py-1 rounded mr-1 mb-1"
                >
                  <Text className="text-cyan-400 text-xs font-medium">
                    {skill}
                  </Text>
                </View>
              ))}
              {hacker.skills.length > 2 && (
                <View className="bg-cyan-400/20 px-2 py-1 rounded mb-1">
                  <Text className="text-cyan-400 text-xs font-medium">
                    +{hacker.skills.length - 2}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text className="text-neutral-500 text-sm">-</Text>
          )}
        </View>
      </View>

      {/* Interests Column */}
      <View
        className="flex-1 px-4 py-4 justify-center"
        style={{ minWidth: 180 }}
      >
        <View className="flex-row flex-wrap">
          {hacker.interest && hacker.interest.length > 0 ? (
            <>
              {hacker.interest.slice(0, 2).map((interest) => (
                <View
                  key={interest}
                  className="bg-teal-400/20 px-2 py-1 rounded mr-1 mb-1"
                >
                  <Text className="text-teal-400 text-xs font-medium">
                    {interest}
                  </Text>
                </View>
              ))}
              {hacker.interest.length > 2 && (
                <View className="bg-teal-400/20 px-2 py-1 rounded mb-1">
                  <Text className="text-teal-400 text-xs font-medium">
                    +{hacker.interest.length - 2}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text className="text-neutral-500 text-sm">-</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const ProfilesScreen = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch hackers with filters
  const {
    data: hackersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchHackers({
    skills: selectedSkills,
    interests: selectedInterests,
  });

  const hackers = (hackersData as HackerProfile[]) || [];

  // Filter hackers based on search query
  const filteredHackers = hackers.filter((hacker) => {
    const fullName =
      `${hacker.hacker_fname} ${hacker.hacker_lname}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Pagination logic
  const totalItems = filteredHackers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedHackers = filteredHackers.slice(startIndex, endIndex);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={isDark ? "#75EDEF" : "#132B38"}
          />
          <Text className={cn("mt-4 text-lg", themeStyles.primaryText)}>
            Loading hackers...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-400 text-lg mb-4">
            Failed to load hackers
          </Text>
          <Text className={cn("mb-6", themeStyles.secondaryText)}>
            {(error as Error)?.message || "An error occurred"}
          </Text>
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
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className={cn("flex-1", themeStyles.background)}>
      <View className="flex-1 px-6 py-6">
        {/* Search Bar */}
        <View className="mb-4">
          <View className="relative max-w-md">
            <View className="absolute left-3 top-3 z-10">
              <Search size={18} color={isDark ? "#888" : "#666"} />
            </View>
            <TextInput
              placeholder="search.."
              placeholderTextColor={isDark ? "#888" : "#666"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className={cn(
                "w-full pl-10 pr-10 py-2 rounded-md border",
                isDark
                  ? "bg-neutral-800 border-neutral-700 text-white"
                  : "bg-white border-neutral-300 text-black"
              )}
            />
            {searchQuery && (
              <Pressable
                onPress={handleClearSearch}
                className="absolute right-3 top-3"
              >
                <X size={18} color={isDark ? "#888" : "#666"} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Table */}
        <ScrollView
          className="flex-1"
          horizontal
          showsHorizontalScrollIndicator={true}
        >
          <View className="flex-1" style={{ minWidth: "100%" }}>
            {/* Table Container */}
            <View
              className={cn(
                "rounded-lg border overflow-hidden",
                isDark
                  ? "bg-neutral-900 border-neutral-800"
                  : "bg-white border-neutral-200"
              )}
            >
              {/* Table Header */}
              <View
                className={cn(
                  "flex-row border-b",
                  isDark ? "border-neutral-800" : "border-neutral-200"
                )}
              >
                <View className="flex-1 px-4 py-3" style={{ minWidth: 200 }}>
                  <Text
                    className={cn(
                      "font-medium text-sm",
                      themeStyles.secondaryText
                    )}
                  >
                    Hacker
                  </Text>
                </View>
                <View className="flex-1 px-4 py-3" style={{ minWidth: 150 }}>
                  <Text
                    className={cn(
                      "font-medium text-sm",
                      themeStyles.secondaryText
                    )}
                  >
                    School
                  </Text>
                </View>
                <View className="flex-1 px-4 py-3" style={{ minWidth: 150 }}>
                  <Text
                    className={cn(
                      "font-medium text-sm",
                      themeStyles.secondaryText
                    )}
                  >
                    Major
                  </Text>
                </View>
                <View className="flex-1 px-4 py-3" style={{ minWidth: 180 }}>
                  <Text
                    className={cn(
                      "font-medium text-sm",
                      themeStyles.secondaryText
                    )}
                  >
                    Skills
                  </Text>
                </View>
                <View className="flex-1 px-4 py-3" style={{ minWidth: 180 }}>
                  <Text
                    className={cn(
                      "font-medium text-sm",
                      themeStyles.secondaryText
                    )}
                  >
                    Projects
                  </Text>
                </View>
              </View>

              {/* Table Body */}
              <ScrollView style={{ maxHeight: 600 }}>
                {paginatedHackers.length > 0 ? (
                  paginatedHackers.map((hacker) => (
                    <HackerRow
                      key={hacker.hacker_id}
                      hacker={hacker}
                      isDark={isDark}
                      themeStyles={themeStyles}
                    />
                  ))
                ) : (
                  <View className="px-4 py-8 items-center">
                    <Text
                      className={cn("text-center", themeStyles.secondaryText)}
                    >
                      {searchQuery
                        ? "No hackers found matching your search"
                        : "No hackers available"}
                    </Text>
                    {searchQuery && (
                      <Pressable onPress={handleClearSearch} className="mt-3">
                        <Text className="text-blue-400 underline text-sm">
                          Clear search
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Pagination */}
            {totalItems > 0 && (
              <View className="flex-row items-center justify-between mt-4">
                <Text className={cn("text-sm", themeStyles.secondaryText)}>
                  Showing {startIndex + 1} to {endIndex} of {totalItems} results
                </Text>
                <View className="flex-row items-center gap-2">
                  {/* Previous Button */}
                  <Pressable
                    onPress={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={cn(
                      "px-3 py-1.5 rounded-md border",
                      isDark
                        ? "bg-neutral-800 border-neutral-700"
                        : "bg-white border-neutral-300",
                      currentPage === 1 && "opacity-50"
                    )}
                  >
                    <Text className={themeStyles.primaryText}>&lt;</Text>
                  </Pressable>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Pressable
                        key={pageNum}
                        onPress={() => setCurrentPage(pageNum)}
                        className={cn(
                          "px-3 py-1.5 rounded-md",
                          currentPage === pageNum
                            ? "bg-blue-400"
                            : isDark
                              ? "bg-neutral-800 border border-neutral-700"
                              : "bg-white border border-neutral-300"
                        )}
                      >
                        <Text
                          className={cn(
                            currentPage === pageNum
                              ? "text-black font-medium"
                              : themeStyles.primaryText
                          )}
                        >
                          {pageNum}
                        </Text>
                      </Pressable>
                    );
                  })}

                  {/* Ellipsis */}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <Text className="px-2">...</Text>
                  )}

                  {/* Next Button */}
                  <Pressable
                    onPress={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={cn(
                      "px-3 py-1.5 rounded-md border",
                      isDark
                        ? "bg-neutral-800 border-neutral-700"
                        : "bg-white border-neutral-300",
                      currentPage === totalPages && "opacity-50"
                    )}
                  >
                    <Text className={themeStyles.primaryText}>&gt;</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default ProfilesScreen;
