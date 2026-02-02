import { useTheme } from "@/context/themeContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useFetchHackers } from "@/queries/hacker";
import { useSavedHackers } from "@/queries/judge";
import { useProjectCategories } from "@/queries/project";
import { useAllSchedules } from "@/queries/schedule/schedule";
import type { HackerProfile } from "@/requests/hacker";
import { ScheduleType } from "@/types/schedule";
import { cn, getThemeStyles } from "@/utils/theme";
import { router, useLocalSearchParams } from "expo-router";
import { Search, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
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
  const params = useLocalSearchParams();

  // Parse URL params helper
  const parseArrayParam = (param: string | string[] | undefined): string[] => {
    if (!param) return [];
    if (Array.isArray(param)) return param;
    return param.split(",").filter(Boolean);
  };

  const parseNumberArrayParam = (
    param: string | string[] | undefined
  ): number[] => {
    const arr = parseArrayParam(param);
    return arr.map(Number).filter((n) => !isNaN(n));
  };

  // Initialize state from URL params
  const [activeTab, setActiveTab] = useState<"all" | "saved">(
    (params.tab as "all" | "saved") || "all"
  );
  const [searchInput, setSearchInput] = useState(
    (params.search as string) || ""
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    parseArrayParam(params.skills)
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    parseArrayParam(params.interests)
  );
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(
    parseArrayParam(params.companies)
  );
  const [selectedEvents, setSelectedEvents] = useState<number[]>(
    parseNumberArrayParam(params.events)
  );
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    parseNumberArrayParam(params.categories)
  );
  const [companyInput, setCompanyInput] = useState("");
  const [currentPage, setCurrentPage] = useState(
    params.page ? parseInt(params.page as string, 10) : 1
  );
  const [educationStartYear, setEducationStartYear] = useState<string>(
    (params.startYear as string) || ""
  );
  const [educationEndYear, setEducationEndYear] = useState<string>(
    (params.endYear as string) || ""
  );
  const [showStartYearDropdown, setShowStartYearDropdown] = useState(false);
  const [showEndYearDropdown, setShowEndYearDropdown] = useState(false);
  const [showEventsDropdown, setShowEventsDropdown] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 600);

  // Fetch project categories and schedules for filter dropdowns
  const { data: projectCategories = [] } = useProjectCategories();
  const { data: allSchedules = [] } = useAllSchedules();

  // Filter events to only show workshops, sponsor events, and mini events
  const attendableEvents = useMemo(() => {
    return allSchedules.filter(
      (schedule) =>
        schedule.type === ScheduleType.WORKSHOP ||
        schedule.type === ScheduleType.SPONSOR ||
        schedule.type === ScheduleType.MINI
    );
  }, [allSchedules]);

  // Sync state to URL params
  useEffect(() => {
    const newParams: Record<string, string> = {};

    if (activeTab !== "all") {
      newParams.tab = activeTab;
    }
    if (searchInput) {
      newParams.search = searchInput;
    }
    if (selectedSkills.length > 0) {
      newParams.skills = selectedSkills.join(",");
    }
    if (selectedInterests.length > 0) {
      newParams.interests = selectedInterests.join(",");
    }
    if (selectedCompanies.length > 0) {
      newParams.companies = selectedCompanies.join(",");
    }
    if (selectedEvents.length > 0) {
      newParams.events = selectedEvents.join(",");
    }
    if (selectedCategories.length > 0) {
      newParams.categories = selectedCategories.join(",");
    }
    if (currentPage > 1) {
      newParams.page = currentPage.toString();
    }
    if (educationStartYear) {
      newParams.startYear = educationStartYear;
    }
    if (educationEndYear) {
      newParams.endYear = educationEndYear;
    }

    router.setParams(newParams);
  }, [
    activeTab,
    searchInput,
    selectedSkills,
    selectedInterests,
    selectedCompanies,
    selectedEvents,
    selectedCategories,
    currentPage,
    educationStartYear,
    educationEndYear,
  ]);

  // Check if any filters are active
  const hasActiveFilters =
    selectedCompanies.length > 0 ||
    selectedEvents.length > 0 ||
    selectedCategories.length > 0 ||
    educationStartYear ||
    educationEndYear;

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchInput("");
    setSelectedCompanies([]);
    setSelectedEvents([]);
    setSelectedCategories([]);
    setEducationStartYear("");
    setEducationEndYear("");
    setCompanyInput("");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedSkills,
    selectedInterests,
    selectedCompanies,
    selectedEvents,
    selectedCategories,
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
    attended_event_ids: selectedEvents.length > 0 ? selectedEvents : undefined,
    submitted_category_ids:
      selectedCategories.length > 0 ? selectedCategories : undefined,
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
    setCurrentPage(1);
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
            onPress={() => {
              setActiveTab("all");
              setCurrentPage(1);
            }}
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
            onPress={() => {
              setActiveTab("saved");
              setCurrentPage(1);
            }}
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

      {/* Main ScrollView containing Search, Filters, and Cards */}
      <ScrollView
        className="flex-1"
        style={{ width: "100%" }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar and Filters - Only show for "All Hackers" tab */}
        {activeTab === "all" && (
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
                      selectedEvents.length +
                      selectedCategories.length +
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
              <ScrollView
                className={cn(
                  "p-4 rounded-lg mb-2",
                  isDark ? "bg-neutral-800/50" : "bg-neutral-100"
                )}
                style={{ maxHeight: 400 }}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
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
                            "mt-1 rounded-md border",
                            isDark
                              ? "bg-neutral-800 border-neutral-700"
                              : "bg-white border-neutral-300"
                          )}
                        >
                          <ScrollView
                            style={{ maxHeight: 192 }}
                            nestedScrollEnabled={true}
                          >
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
                            "mt-1 rounded-md border",
                            isDark
                              ? "bg-neutral-800 border-neutral-700"
                              : "bg-white border-neutral-300"
                          )}
                        >
                          <ScrollView
                            style={{ maxHeight: 192 }}
                            nestedScrollEnabled={true}
                          >
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
                <View>
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
                            <X
                              size={14}
                              color={isDark ? "#75EDEF" : "#132B38"}
                            />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Event Attendance Filter */}
                <View className="mt-4">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-3",
                      themeStyles.primaryText
                    )}
                  >
                    EVENT ATTENDANCE
                  </Text>
                  <View className="relative">
                    <Pressable
                      onPress={() => setShowEventsDropdown(!showEventsDropdown)}
                      className={cn(
                        "px-3 py-2 rounded-md border flex-row justify-between items-center",
                        isDark
                          ? "bg-neutral-800 border-neutral-700"
                          : "bg-white border-neutral-300"
                      )}
                    >
                      <Text
                        className={cn(
                          selectedEvents.length > 0
                            ? themeStyles.primaryText
                            : "text-neutral-500"
                        )}
                      >
                        {selectedEvents.length > 0
                          ? `${selectedEvents.length} event(s) selected`
                          : "Select events"}
                      </Text>
                      <Text className={themeStyles.secondaryText}>▼</Text>
                    </Pressable>
                    {showEventsDropdown && (
                      <View
                        className={cn(
                          "mt-1 rounded-md border",
                          isDark
                            ? "bg-neutral-800 border-neutral-700"
                            : "bg-white border-neutral-300"
                        )}
                      >
                        <ScrollView
                          style={{ maxHeight: 192 }}
                          nestedScrollEnabled={true}
                        >
                          <Pressable
                            onPress={() => {
                              setSelectedEvents([]);
                              setShowEventsDropdown(false);
                            }}
                            className="px-3 py-2 border-b border-neutral-700"
                          >
                            <Text className="text-neutral-500">Clear</Text>
                          </Pressable>
                          {attendableEvents.map((schedule) => {
                            const scheduleId = Number(schedule.id);
                            const isSelected =
                              selectedEvents.includes(scheduleId);
                            return (
                              <Pressable
                                key={schedule.id}
                                onPress={() => {
                                  if (isSelected) {
                                    setSelectedEvents(
                                      selectedEvents.filter(
                                        (id) => id !== scheduleId
                                      )
                                    );
                                  } else {
                                    setSelectedEvents([
                                      ...selectedEvents,
                                      scheduleId,
                                    ]);
                                  }
                                }}
                                className={cn(
                                  "px-3 py-2 border-b flex-row items-center justify-between",
                                  isDark
                                    ? "border-neutral-700"
                                    : "border-neutral-200",
                                  isSelected &&
                                    (isDark
                                      ? "bg-neutral-700"
                                      : "bg-neutral-100")
                                )}
                              >
                                <Text
                                  className={cn(
                                    themeStyles.primaryText,
                                    "flex-1"
                                  )}
                                >
                                  {schedule.title}
                                </Text>
                                {isSelected && (
                                  <Text className="text-green-500 ml-2">✓</Text>
                                )}
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                  {selectedEvents.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mt-3">
                      {selectedEvents.map((eventId) => {
                        const event = attendableEvents.find(
                          (s) => Number(s.id) === eventId
                        );
                        return (
                          <View
                            key={eventId}
                            className={cn(
                              "flex-row items-center px-3 py-1.5 rounded-full",
                              isDark
                                ? "bg-purple-500/20 border border-purple-500/30"
                                : "bg-purple-100 border border-purple-200"
                            )}
                          >
                            <Text
                              className={cn(
                                "text-sm mr-2 font-medium",
                                isDark ? "text-purple-400" : "text-purple-700"
                              )}
                            >
                              {event?.title || `Event ${eventId}`}
                            </Text>
                            <Pressable
                              onPress={() => {
                                setSelectedEvents(
                                  selectedEvents.filter((id) => id !== eventId)
                                );
                              }}
                            >
                              <X
                                size={14}
                                color={isDark ? "#c084fc" : "#6b21a8"}
                              />
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Project Categories Filter */}
                <View className="mt-4">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-3",
                      themeStyles.primaryText
                    )}
                  >
                    PROJECT CATEGORIES
                  </Text>
                  <View className="relative">
                    <Pressable
                      onPress={() =>
                        setShowCategoriesDropdown(!showCategoriesDropdown)
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
                          selectedCategories.length > 0
                            ? themeStyles.primaryText
                            : "text-neutral-500"
                        )}
                      >
                        {selectedCategories.length > 0
                          ? `${selectedCategories.length} category(ies) selected`
                          : "Select categories"}
                      </Text>
                      <Text className={themeStyles.secondaryText}>▼</Text>
                    </Pressable>
                    {showCategoriesDropdown && (
                      <View
                        className={cn(
                          "mt-1 rounded-md border",
                          isDark
                            ? "bg-neutral-800 border-neutral-700"
                            : "bg-white border-neutral-300"
                        )}
                      >
                        <ScrollView
                          style={{ maxHeight: 192 }}
                          nestedScrollEnabled={true}
                        >
                          <Pressable
                            onPress={() => {
                              setSelectedCategories([]);
                              setShowCategoriesDropdown(false);
                            }}
                            className="px-3 py-2 border-b border-neutral-700"
                          >
                            <Text className="text-neutral-500">Clear</Text>
                          </Pressable>
                          {projectCategories.map((category) => {
                            const isSelected = selectedCategories.includes(
                              category.project_category_id
                            );
                            return (
                              <Pressable
                                key={category.project_category_id}
                                onPress={() => {
                                  if (isSelected) {
                                    setSelectedCategories(
                                      selectedCategories.filter(
                                        (id) =>
                                          id !== category.project_category_id
                                      )
                                    );
                                  } else {
                                    setSelectedCategories([
                                      ...selectedCategories,
                                      category.project_category_id,
                                    ]);
                                  }
                                }}
                                className={cn(
                                  "px-3 py-2 border-b flex-row items-center justify-between",
                                  isDark
                                    ? "border-neutral-700"
                                    : "border-neutral-200",
                                  isSelected &&
                                    (isDark
                                      ? "bg-neutral-700"
                                      : "bg-neutral-100")
                                )}
                              >
                                <Text
                                  className={cn(
                                    themeStyles.primaryText,
                                    "flex-1"
                                  )}
                                >
                                  {category.project_category_name}
                                </Text>
                                {isSelected && (
                                  <Text className="text-green-500 ml-2">✓</Text>
                                )}
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                  {selectedCategories.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mt-3">
                      {selectedCategories.map((categoryId) => {
                        const category = projectCategories.find(
                          (c) => c.project_category_id === categoryId
                        );
                        return (
                          <View
                            key={categoryId}
                            className={cn(
                              "flex-row items-center px-3 py-1.5 rounded-full",
                              isDark
                                ? "bg-blue-500/20 border border-blue-500/30"
                                : "bg-blue-100 border border-blue-200"
                            )}
                          >
                            <Text
                              className={cn(
                                "text-sm mr-2 font-medium",
                                isDark ? "text-blue-400" : "text-blue-700"
                              )}
                            >
                              {category?.project_category_name ||
                                `Category ${categoryId}`}
                            </Text>
                            <Pressable
                              onPress={() => {
                                setSelectedCategories(
                                  selectedCategories.filter(
                                    (id) => id !== categoryId
                                  )
                                );
                              }}
                            >
                              <X
                                size={14}
                                color={isDark ? "#60a5fa" : "#1d4ed8"}
                              />
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        )}

        {/* Cards */}
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
