import { useTheme } from "@/context/themeContext";
import { useDebounce } from "@/hooks/useDebounce";
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

interface HackerRowProps {
  hacker: HackerProfile;
  isDark: boolean;
  themeStyles: any;
  onProfilePress?: (hackerId: number) => void;
}

const HackerRow = ({
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
    <View
      className={cn(
        "flex-row border-b",
        isDark ? "border-neutral-800" : "border-neutral-200"
      )}
      style={{ minHeight: 60, width: "100%" }}
    >
      {/* Hacker Column */}
      <View className="px-4 py-4 justify-center" style={{ flex: 2 }}>
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
      <View className="px-4 py-4 justify-center" style={{ flex: 1.5 }}>
        <Text className={cn(themeStyles.secondaryText)}>
          {hacker.school || <Text className="text-neutral-500 text-sm">-</Text>}
        </Text>
      </View>

      {/* Major Column */}
      <View className="px-4 py-4 justify-center" style={{ flex: 1.5 }}>
        <Text className={cn(themeStyles.secondaryText)}>
          {hacker.major || <Text className="text-neutral-500 text-sm">-</Text>}
        </Text>
      </View>

      {/* Skills Column */}
      <View className="px-4 py-4 justify-center" style={{ flex: 2 }}>
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
      <View className="px-4 py-4 justify-center" style={{ flex: 2 }}>
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

  // Debounce search input for backend API calls (longer debounce for cosine similarity)
  const debouncedSearch = useDebounce(searchInput, 600);

  // Fetch hackers with filters (using backend pagination)
  const {
    data: hackersData,
    isLoading,
    isError,
    error,
    refetch,
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

  const hackers = hackersData?.data || [];
  const pageInfo = hackersData?.page_info;

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
      {/* Search Bar and Filters */}
      <View className="px-6 py-4">
        <View className="relative max-w-md mb-4">
          <View className="absolute left-3 top-3 z-10">
            <Search size={18} color={isDark ? "#888" : "#666"} />
          </View>
          <TextInput
            placeholder="Search hackers by name, skills, bio..."
            placeholderTextColor={isDark ? "#888" : "#666"}
            value={searchInput}
            onChangeText={setSearchInput}
            className={cn(
              "w-full pl-10 pr-10 py-2 rounded-md border",
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

        {/* Education Year Filters */}
        <View className="flex-row gap-4 max-w-md">
          <View className="flex-1">
            <Text className={cn("text-sm mb-2", themeStyles.secondaryText)}>
              Education Start Year
            </Text>
            <View className="relative">
              <Pressable
                onPress={() => setShowStartYearDropdown(!showStartYearDropdown)}
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
                          isDark ? "border-neutral-700" : "border-neutral-200"
                        )}
                      >
                        <Text className={themeStyles.primaryText}>{year}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
          <View className="flex-1">
            <Text className={cn("text-sm mb-2", themeStyles.secondaryText)}>
              Education End Year
            </Text>
            <View className="relative">
              <Pressable
                onPress={() => setShowEndYearDropdown(!showEndYearDropdown)}
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
                          isDark ? "border-neutral-700" : "border-neutral-200"
                        )}
                      >
                        <Text className={themeStyles.primaryText}>{year}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Company Filter */}
        <View className="mt-4" style={{ zIndex: -1000 }}>
          <Text className={cn("text-sm mb-2", themeStyles.secondaryText)}>
            Filter by Company
          </Text>
          <View className="flex-row gap-2">
            <TextInput
              value={companyInput}
              onChangeText={setCompanyInput}
              placeholder="Enter company name..."
              placeholderTextColor={isDark ? "#888" : "#666"}
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
                "flex-1 px-3 py-2 rounded-md border",
                isDark
                  ? "bg-neutral-800 border-neutral-700 text-white"
                  : "bg-white border-neutral-300 text-black"
              )}
            />
            <Pressable
              onPress={() => {
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
                "px-4 py-2 rounded-md",
                isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
              )}
            >
              <Text
                className={cn(
                  "font-semibold",
                  isDark ? "text-black" : "text-white"
                )}
              >
                Add
              </Text>
            </Pressable>
          </View>
          {selectedCompanies.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-2">
              {selectedCompanies.map((company) => (
                <View
                  key={company}
                  className={cn(
                    "flex-row items-center px-3 py-1 rounded-full",
                    isDark ? "bg-neutral-700" : "bg-neutral-200"
                  )}
                >
                  <Text className={cn("text-sm mr-2", themeStyles.primaryText)}>
                    {company}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setSelectedCompanies(
                        selectedCompanies.filter((c) => c !== company)
                      );
                    }}
                  >
                    <X size={16} color={isDark ? "#888" : "#666"} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Table */}
      <View
        className="flex-1"
        style={{ width: "100%", overflow: "hidden", zIndex: -1000 }}
      >
        <View
          className={cn(
            "border-t flex-1",
            isDark
              ? "bg-neutral-900 border-neutral-800"
              : "bg-white border-neutral-200"
          )}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Table Header */}
          <View
            className={cn(
              "flex-row border-b",
              isDark ? "border-neutral-800" : "border-neutral-200"
            )}
            style={{ width: "100%" }}
          >
            <View className="px-4 py-3" style={{ flex: 2 }}>
              <Text
                className={cn("font-medium text-sm", themeStyles.secondaryText)}
              >
                Hacker
              </Text>
            </View>
            <View className="px-4 py-3" style={{ flex: 1.5 }}>
              <Text
                className={cn("font-medium text-sm", themeStyles.secondaryText)}
              >
                School
              </Text>
            </View>
            <View className="px-4 py-3" style={{ flex: 1.5 }}>
              <Text
                className={cn("font-medium text-sm", themeStyles.secondaryText)}
              >
                Major
              </Text>
            </View>
            <View className="px-4 py-3" style={{ flex: 2 }}>
              <Text
                className={cn("font-medium text-sm", themeStyles.secondaryText)}
              >
                Skills
              </Text>
            </View>
            <View className="px-4 py-3" style={{ flex: 2 }}>
              <Text
                className={cn("font-medium text-sm", themeStyles.secondaryText)}
              >
                Projects
              </Text>
            </View>
          </View>

          {/* Table Body */}
          <ScrollView style={{ flex: 1 }}>
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
              paginatedHackers.map((hacker) => (
                <HackerRow
                  key={hacker.hacker_id}
                  hacker={hacker}
                  isDark={isDark}
                  themeStyles={themeStyles}
                  onProfilePress={onProfilePress}
                />
              ))
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
          </ScrollView>

          {/* Pagination */}
          {enablePagination && totalItems > 0 && (
            <View
              className="flex-row items-center justify-between px-6 py-4 border-t"
              style={{
                borderTopColor: isDark ? "#262626" : "#e5e5e5",
              }}
            >
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
      </View>
    </View>
  );
};
