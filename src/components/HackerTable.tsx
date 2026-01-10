import { useTheme } from "@/context/themeContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useFetchHackers } from "@/queries/hacker";
import { useSavedHackers } from "@/queries/judge";
import type { HackerProfile } from "@/requests/hacker";
import { cn, getThemeStyles } from "@/utils/theme";
import { router } from "expo-router";
import { Search, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

interface HackerRowProps {
  hacker: HackerProfile;
  isDark: boolean;
  themeStyles: any;
  onProfilePress?: (hackerId: number) => void;
}

const HackerCard = ({
  hacker,
  isDark,
  themeStyles,
  onProfilePress,
}: HackerRowProps) => {
  const handleViewProfile = () => {
    if (onProfilePress) {
      onProfilePress(hacker.hacker_id);
    } else {
      router.push(`/profile/${hacker.hacker_id}` as any);
    }
  };

  return (
    <Pressable
      onPress={handleViewProfile}
      className={cn(
        "mx-4 mb-4 p-4 rounded-xl",
        isDark ? "bg-neutral-800" : "bg-white",
        "border",
        isDark ? "border-neutral-700" : "border-neutral-200"
      )}
    >
      {/* Header with Avatar and Name */}
      <View className="flex-row items-center mb-3">
        <View
          className={cn(
            "w-12 h-12 rounded-full items-center justify-center mr-3",
            isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
          )}
        >
          <Text
            className={cn(
              "font-bold text-lg",
              isDark ? "text-black" : "text-white"
            )}
          >
            {hacker.hacker_fname[0]}
            {hacker.hacker_lname[0]}
          </Text>
        </View>
        <View className="flex-1">
          <Text
            className={cn("text-lg font-onest-bold", themeStyles.primaryText)}
          >
            {hacker.hacker_fname} {hacker.hacker_lname}
          </Text>
          {hacker.checked_in ? (
            <View className="flex-row items-center mt-1">
              <View className="bg-green-500/20 px-2 py-0.5 rounded-full">
                <Text className="text-green-500 text-xs font-semibold">
                  Checked In
                </Text>
              </View>
            </View>
          ) : (
            <View className="flex-row items-center mt-1">
              <View className="bg-neutral-500/20 px-2 py-0.5 rounded-full">
                <Text className="text-neutral-500 text-xs font-semibold">
                  Not Checked In
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* School and Major */}
      {(hacker.school || hacker.major) && (
        <View className="mb-3">
          {hacker.school && (
            <Text className={cn("text-sm mb-1", themeStyles.secondaryText)}>
              {hacker.school}
            </Text>
          )}
          {hacker.major && (
            <Text className={cn("text-sm", themeStyles.secondaryText)}>
              {hacker.major}
            </Text>
          )}
        </View>
      )}

      {/* Skills */}
      {hacker.skills && hacker.skills.length > 0 && (
        <View className="mb-3">
          <Text
            className={cn(
              "text-xs font-semibold mb-2",
              themeStyles.secondaryText
            )}
          >
            SKILLS
          </Text>
          <View className="flex-row flex-wrap">
            {hacker.skills.slice(0, 5).map((skill) => (
              <View
                key={skill}
                className="bg-cyan-400/20 px-2 py-1 rounded mr-1 mb-1"
              >
                <Text className="text-cyan-400 text-xs font-medium">
                  {skill}
                </Text>
              </View>
            ))}
            {hacker.skills.length > 5 && (
              <View className="bg-cyan-400/20 px-2 py-1 rounded mb-1">
                <Text className="text-cyan-400 text-xs font-medium">
                  +{hacker.skills.length - 5}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Interests */}
      {hacker.interest && hacker.interest.length > 0 && (
        <View className="mb-2">
          <Text
            className={cn(
              "text-xs font-semibold mb-2",
              themeStyles.secondaryText
            )}
          >
            INTERESTS
          </Text>
          <View className="flex-row flex-wrap">
            {hacker.interest.slice(0, 5).map((interest) => (
              <View
                key={interest}
                className="bg-teal-400/20 px-2 py-1 rounded mr-1 mb-1"
              >
                <Text className="text-teal-400 text-xs font-medium">
                  {interest}
                </Text>
              </View>
            ))}
            {hacker.interest.length > 5 && (
              <View className="bg-teal-400/20 px-2 py-1 rounded mb-1">
                <Text className="text-teal-400 text-xs font-medium">
                  +{hacker.interest.length - 5}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* View Profile Link */}
      <View
        className="mt-2 pt-3 border-t"
        style={{ borderTopColor: isDark ? "#404040" : "#e5e5e5" }}
      >
        <Text className="text-blue-400 text-sm font-medium text-center">
          Tap to View Full Profile →
        </Text>
      </View>
    </Pressable>
  );
};

export interface HackerTableProps {
  onProfilePress?: (hackerId: number) => void;
  enablePagination?: boolean;
  itemsPerPage?: number;
}

export const HackerTable = ({
  onProfilePress,
  enablePagination = true,
  itemsPerPage = 10,
}: HackerTableProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
  const [searchInput, setSearchInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [companyInput, setCompanyInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [educationStartYear, setEducationStartYear] = useState<string>("");
  const [educationEndYear, setEducationEndYear] = useState<string>("");
  const [showStartYearDropdown, setShowStartYearDropdown] = useState(false);
  const [showEndYearDropdown, setShowEndYearDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const debouncedSearch = useDebounce(searchInput, 600);

  // Handle scroll to show/hide search bar
  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;

    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      // Scrolling down - hide search bar
      setShowSearchBar(false);
      setShowFilters(false);
    } else if (currentScrollY < lastScrollY) {
      // Scrolling up - show search bar
      setShowSearchBar(true);
    }

    setLastScrollY(currentScrollY);
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedCompanies.length > 0 || educationStartYear || educationEndYear;

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchInput("");
    setSelectedCompanies([]);
    setEducationStartYear("");
    setEducationEndYear("");
    setCompanyInput("");
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedSkills,
    selectedInterests,
    selectedCompanies,
    educationStartYear,
    educationEndYear,
    debouncedSearch,
  ]);

  // Fetch hackers with filters (using backend pagination)
  const {
    data: hackersData,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    error: errorAll,
    refetch: refetchAll,
  } = useFetchHackers({
    skills: selectedSkills.length > 0 ? selectedSkills : undefined,
    interests: selectedInterests.length > 0 ? selectedInterests : undefined,
    companies: selectedCompanies.length > 0 ? selectedCompanies : undefined,
    search_query: debouncedSearch || undefined,
    page: enablePagination ? currentPage : undefined,
    page_size: enablePagination ? itemsPerPage : undefined,
    has_rsvpd: true,
    start_grad_date: educationStartYear
      ? new Date(`${educationStartYear}-01-01`).toISOString()
      : undefined,
    end_grad_date: educationEndYear
      ? new Date(`${educationEndYear}-12-31`).toISOString()
      : undefined,
  });

  // Fetch saved hackers (no filters)
  const {
    data: savedHackersData,
    isLoading: isLoadingSaved,
    isError: isErrorSaved,
    error: errorSaved,
    refetch: refetchSaved,
  } = useSavedHackers(
    enablePagination ? currentPage : 1,
    enablePagination ? itemsPerPage : 100,
    activeTab === "saved"
  );

  // Use the appropriate data based on active tab
  const isLoading = activeTab === "all" ? isLoadingAll : isLoadingSaved;
  const isError = activeTab === "all" ? isErrorAll : isErrorSaved;
  const error = activeTab === "all" ? errorAll : errorSaved;
  const refetch = activeTab === "all" ? refetchAll : refetchSaved;

  const hackers =
    activeTab === "all"
      ? hackersData?.data || []
      : savedHackersData?.data || [];
  const pageInfo =
    activeTab === "all" ? hackersData?.page_info : savedHackersData?.page_info;

  // Use backend pagination info
  const totalItems = pageInfo?.total || 0;
  const totalPages = pageInfo?.total_pages || 0;
  const startIndex = pageInfo ? (pageInfo.page - 1) * pageInfo.page_size : 0;
  const endIndex = pageInfo
    ? Math.min(startIndex + pageInfo.page_size, pageInfo.total)
    : 0;
  const paginatedHackers = hackers;

  const handleClearSearch = () => {
    setSearchInput("");
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => 2020 + i);

  return (
    <View className="flex-1" style={{ width: "100%", height: "100%" }}>
      {/* Tab Selector */}
      <View className="px-6 pt-4 pb-2">
        <View
          className={cn(
            "flex-row rounded-lg p-1",
            isDark ? "bg-neutral-800" : "bg-neutral-200"
          )}
        >
          <Pressable
            onPress={() => setActiveTab("all")}
            className={cn(
              "flex-1 py-3 rounded-lg",
              activeTab === "all"
                ? isDark
                  ? "bg-[#75EDEF]"
                  : "bg-[#132B38]"
                : ""
            )}
          >
            <Text
              className={cn(
                "text-center font-onest-bold",
                activeTab === "all"
                  ? isDark
                    ? "text-black"
                    : "text-white"
                  : themeStyles.secondaryText
              )}
            >
              All Hackers
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("saved")}
            className={cn(
              "flex-1 py-3 rounded-lg",
              activeTab === "saved"
                ? isDark
                  ? "bg-[#75EDEF]"
                  : "bg-[#132B38]"
                : ""
            )}
          >
            <Text
              className={cn(
                "text-center font-onest-bold",
                activeTab === "saved"
                  ? isDark
                    ? "text-black"
                    : "text-white"
                  : themeStyles.secondaryText
              )}
            >
              Saved Hackers
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Search Bar and Filters - Only show for "All Hackers" tab */}
      {showSearchBar && activeTab === "all" && (
        <View className="px-6 py-4">
          {/* Main Search Bar */}
          <View className="relative mb-3">
            <View className="absolute left-3 top-3 z-10">
              <Search size={18} color={isDark ? "#888" : "#666"} />
            </View>
            <TextInput
              placeholder="Search by name..."
              placeholderTextColor={isDark ? "#888" : "#666"}
              value={searchInput}
              onChangeText={setSearchInput}
              className={cn(
                "w-full pl-10 pr-10 py-3 rounded-lg border",
                isDark
                  ? "bg-neutral-800 border-neutral-700 text-white"
                  : "bg-white border-neutral-300 text-black"
              )}
            />
            {searchInput && (
              <Pressable
                onPress={handleClearSearch}
                className="absolute right-3 top-3"
              >
                <X size={18} color={isDark ? "#888" : "#666"} />
              </Pressable>
            )}
          </View>

          {/* Filter Controls Row */}
          <View className="flex-row items-center justify-between mb-3">
            <Pressable
              onPress={() => setShowFilters(!showFilters)}
              className={cn(
                "flex-row items-center px-4 py-2 rounded-lg",
                isDark ? "bg-neutral-800" : "bg-neutral-200"
              )}
            >
              <Text
                className={cn(
                  "text-sm font-medium mr-2",
                  themeStyles.primaryText
                )}
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
                {hasActiveFilters &&
                  ` (${
                    selectedCompanies.length +
                    (educationStartYear ? 1 : 0) +
                    (educationEndYear ? 1 : 0)
                  })`}
              </Text>
              <Text className={cn("text-xs", themeStyles.secondaryText)}>
                {showFilters ? "▲" : "▼"}
              </Text>
            </Pressable>

            {hasActiveFilters && (
              <Pressable
                onPress={handleClearAllFilters}
                className={cn(
                  "px-4 py-2 rounded-lg",
                  isDark ? "bg-red-500/20" : "bg-red-100"
                )}
              >
                <Text
                  className={cn(
                    "text-sm font-medium",
                    isDark ? "text-red-400" : "text-red-600"
                  )}
                >
                  Clear All
                </Text>
              </Pressable>
            )}
          </View>

          {/* Collapsible Filters Section */}
          {showFilters && (
            <View
              className={cn(
                "p-4 rounded-lg mb-2",
                isDark ? "bg-neutral-800/50" : "bg-neutral-100"
              )}
            >
              {/* Graduation Year Filter */}
              <Text
                className={cn(
                  "text-sm font-semibold mb-3",
                  themeStyles.primaryText
                )}
              >
                GRADUATION YEAR
              </Text>
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text
                    className={cn("text-xs mb-2", themeStyles.secondaryText)}
                  >
                    From
                  </Text>
                  <View className="relative">
                    <Pressable
                      onPress={() =>
                        setShowStartYearDropdown(!showStartYearDropdown)
                      }
                      className={cn(
                        "px-3 py-2 rounded-md border flex-row justify-between items-center",
                        isDark
                          ? "bg-neutral-800 border-neutral-700"
                          : "bg-white border-neutral-300"
                      )}
                    >
                      <Text
                        className={cn(
                          educationStartYear
                            ? themeStyles.primaryText
                            : "text-neutral-500"
                        )}
                      >
                        {educationStartYear || "Select year"}
                      </Text>
                      <Text className={themeStyles.secondaryText}>▼</Text>
                    </Pressable>
                    {showStartYearDropdown && (
                      <View
                        className={cn(
                          "absolute top-full left-0 right-0 mt-1 rounded-md border max-h-48",
                          isDark
                            ? "bg-neutral-800 border-neutral-700"
                            : "bg-white border-neutral-300"
                        )}
                        style={{ zIndex: 9999 }}
                      >
                        <ScrollView style={{ maxHeight: 192 }}>
                          <Pressable
                            onPress={() => {
                              setEducationStartYear("");
                              setShowStartYearDropdown(false);
                            }}
                            className="px-3 py-2 border-b border-neutral-700"
                          >
                            <Text className="text-neutral-500">Clear</Text>
                          </Pressable>
                          {yearOptions.map((year) => (
                            <Pressable
                              key={year}
                              onPress={() => {
                                setEducationStartYear(year.toString());
                                setShowStartYearDropdown(false);
                              }}
                              className={cn(
                                "px-3 py-2 border-b",
                                isDark
                                  ? "border-neutral-700"
                                  : "border-neutral-200"
                              )}
                            >
                              <Text className={themeStyles.primaryText}>
                                {year}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
                <View className="flex-1">
                  <Text
                    className={cn("text-xs mb-2", themeStyles.secondaryText)}
                  >
                    To
                  </Text>
                  <View className="relative">
                    <Pressable
                      onPress={() =>
                        setShowEndYearDropdown(!showEndYearDropdown)
                      }
                      className={cn(
                        "px-3 py-2 rounded-md border flex-row justify-between items-center",
                        isDark
                          ? "bg-neutral-800 border-neutral-700"
                          : "bg-white border-neutral-300"
                      )}
                    >
                      <Text
                        className={cn(
                          educationEndYear
                            ? themeStyles.primaryText
                            : "text-neutral-500"
                        )}
                      >
                        {educationEndYear || "Select year"}
                      </Text>
                      <Text className={themeStyles.secondaryText}>▼</Text>
                    </Pressable>
                    {showEndYearDropdown && (
                      <View
                        className={cn(
                          "absolute top-full left-0 right-0 mt-1 rounded-md border max-h-48",
                          isDark
                            ? "bg-neutral-800 border-neutral-700"
                            : "bg-white border-neutral-300"
                        )}
                        style={{ zIndex: 9999 }}
                      >
                        <ScrollView style={{ maxHeight: 192 }}>
                          <Pressable
                            onPress={() => {
                              setEducationEndYear("");
                              setShowEndYearDropdown(false);
                            }}
                            className="px-3 py-2 border-b border-neutral-700"
                          >
                            <Text className="text-neutral-500">Clear</Text>
                          </Pressable>
                          {yearOptions.map((year) => (
                            <Pressable
                              key={year}
                              onPress={() => {
                                setEducationEndYear(year.toString());
                                setShowEndYearDropdown(false);
                              }}
                              className={cn(
                                "px-3 py-2 border-b",
                                isDark
                                  ? "border-neutral-700"
                                  : "border-neutral-200"
                              )}
                            >
                              <Text className={themeStyles.primaryText}>
                                {year}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Company Filter */}
              <View style={{ zIndex: -1000 }}>
                <Text
                  className={cn(
                    "text-sm font-semibold mb-3",
                    themeStyles.primaryText
                  )}
                >
                  PREVIOUS COMPANIES
                </Text>
                <TextInput
                  value={companyInput}
                  onChangeText={setCompanyInput}
                  placeholder="Type company name and press Enter..."
                  placeholderTextColor={isDark ? "#888" : "#666"}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (
                      companyInput.trim() &&
                      !selectedCompanies.includes(companyInput.trim())
                    ) {
                      setSelectedCompanies([
                        ...selectedCompanies,
                        companyInput.trim(),
                      ]);
                      setCompanyInput("");
                    }
                  }}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border",
                    isDark
                      ? "bg-neutral-700 border-neutral-600 text-white"
                      : "bg-white border-neutral-300 text-black"
                  )}
                />
                {selectedCompanies.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 mt-3">
                    {selectedCompanies.map((company) => (
                      <View
                        key={company}
                        className={cn(
                          "flex-row items-center px-3 py-1.5 rounded-full",
                          isDark
                            ? "bg-[#75EDEF]/20 border border-[#75EDEF]/30"
                            : "bg-[#132B38]/10 border border-[#132B38]/20"
                        )}
                      >
                        <Text
                          className={cn(
                            "text-sm mr-2 font-medium",
                            isDark ? "text-[#75EDEF]" : "text-[#132B38]"
                          )}
                        >
                          {company}
                        </Text>
                        <Pressable
                          onPress={() => {
                            setSelectedCompanies(
                              selectedCompanies.filter((c) => c !== company)
                            );
                          }}
                        >
                          <X size={14} color={isDark ? "#75EDEF" : "#132B38"} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Cards */}
      <ScrollView
        className="flex-1"
        style={{ width: "100%", zIndex: -1000 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {isLoading ? (
          <View className="px-4 py-8 items-center">
            <ActivityIndicator
              size="large"
              color={isDark ? "#75EDEF" : "#132B38"}
            />
            <Text className={cn("mt-4 text-lg", themeStyles.primaryText)}>
              Loading hackers...
            </Text>
          </View>
        ) : isError ? (
          <View className="px-4 py-8 items-center">
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
        ) : paginatedHackers.length > 0 ? (
          <View className="pt-4">
            {paginatedHackers.map((hacker) => (
              <HackerCard
                key={hacker.hacker_id}
                hacker={hacker}
                isDark={isDark}
                themeStyles={themeStyles}
                onProfilePress={onProfilePress}
              />
            ))}
          </View>
        ) : (
          <View className="px-4 py-8 items-center">
            <Text className={cn("text-center", themeStyles.secondaryText)}>
              {searchInput
                ? "No hackers found matching your search"
                : "No hackers available"}
            </Text>
            {searchInput && (
              <Pressable onPress={handleClearSearch} className="mt-3">
                <Text className="text-blue-400 underline text-sm">
                  Clear search
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Pagination - moved inside ScrollView */}
        {enablePagination && totalItems > 0 && (
          <View className="px-6 py-4 mb-4">
            <Text
              className={cn(
                "text-sm text-center mb-3",
                themeStyles.secondaryText
              )}
            >
              Showing {startIndex + 1} to {endIndex} of {totalItems} results
            </Text>
            <View className="flex-row items-center justify-center gap-2 flex-wrap">
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
                <Text className={cn("px-2", themeStyles.secondaryText)}>
                  ...
                </Text>
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
        {/* Spacer for bottom navigation bar */}
        <View className="h-32" />
      </ScrollView>
    </View>
  );
};
