import { ScoringSlider } from "@/components/ScoringSlider";
import { useTheme } from "@/context/themeContext";
import {
  computeRemainingSecondsFromStart,
  computeRemainingSecondsFromTimer,
  useTimer,
} from "@/context/timerContext";
import { useSubmitScore } from "@/queries/scoring";
import { useJudgeSchedules } from "@/queries/judging";
import { ScoringCriteria, SCORING_CRITERIA_INFO } from "@/types/scoring";
import { cn, getThemeStyles } from "@/utils/theme";
import { getJudgeId } from "@/utils/tokens/secureStorage";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";

const Scorecard = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const params = useLocalSearchParams();
  const timerContext = useTimer();

  const [judgeId, setJudgeId] = useState<number | null>(null);
  const [scheduleId, setScheduleId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const [nowTs, setNowTs] = useState(Date.now());
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [scores, setScores] = useState<ScoringCriteria>({
    design: 0,
    completion: 0,
    theme_relevance: 0,
    idea_innovation: 0,
    technology: 0,
    pitching: 0,
    time_management: 0,
  });

  const submitScoreMutation = useSubmitScore();

  // Load data from params/storage
  useEffect(() => {
    const loadData = async () => {
      const storedJudgeId = await getJudgeId();
      setJudgeId(storedJudgeId);

      if (params.scheduleId && typeof params.scheduleId === "string") {
        setScheduleId(parseInt(params.scheduleId));
      }
    };
    loadData();
  }, [params]);

  // Reset submission state when viewing a new schedule
  useEffect(() => {
    setHasSubmitted(false);
  }, [scheduleId]);

  const {
    data: judgeSchedules,
    refetch: refetchJudgeSchedules,
    isFetching: isFetchingJudgeSchedules,
    isLoading: isLoadingJudgeSchedules,
    isError: isJudgeSchedulesError,
  } = useJudgeSchedules(judgeId, !!judgeId);

  // Keep now ticking locally for countdown/auto-submit
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Refetch schedules when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (refetchJudgeSchedules) {
        refetchJudgeSchedules();
      }
    }, [refetchJudgeSchedules])
  );

  const currentSchedule = useMemo(() => {
    if (!judgeSchedules || !scheduleId) return null;
    return judgeSchedules.find((s) => s.judging_schedule_id === scheduleId);
  }, [judgeSchedules, scheduleId]);

  const project = currentSchedule?.team?.project;
  const projectId = useMemo(() => {
    if (project?.project_id) return project.project_id;
    if (params.projectId && typeof params.projectId === "string") {
      return parseInt(params.projectId);
    }
    return null;
  }, [params.projectId, project?.project_id]);

  const locationName = currentSchedule
    ? typeof currentSchedule.location === "string"
      ? currentSchedule.location
      : currentSchedule.location.location_name
    : "";

  // Note: Room timer is now managed by WebSocket listener (useJudgeTimerWebSocket)
  // No need to hydrate here - the WebSocket will update roomTimers in real-time

  // Calculate total score
  const totalScore = Object.values(scores).reduce((sum, val) => sum + val, 0);
  const maxScore = 27; // Design(3) + Completion(4) + Theme(3) + Innovation(5) + Tech(5) + Pitching(5) + Time(2)

  // Calculate round information
  const getRoundInfo = () => {
    if (!judgeSchedules || !scheduleId) {
      return { currentRound: 1, totalRounds: 1 };
    }

    const sortedSchedules = [...judgeSchedules].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const currentRound =
      sortedSchedules.findIndex((s) => s.judging_schedule_id === scheduleId) +
      1;

    return {
      currentRound: currentRound > 0 ? currentRound : 1,
      totalRounds: judgeSchedules.length,
    };
  };

  const roomTimer = locationName
    ? timerContext.roomTimers[locationName]
    : undefined;
  const remainingSeconds = computeRemainingSecondsFromTimer(roomTimer, nowTs);
  const timerStatusLabel =
    roomTimer?.status === "paused"
      ? "Timer paused by admin"
      : roomTimer?.status === "stopped"
        ? "Timer ended by admin"
        : null;
  const canEditScores =
    !!roomTimer && roomTimer.status === "running" && !hasSubmitted;
  const isSliderDisabled = !canEditScores; // Lock sliders when timer is paused/stopped or scores are submitted
  const submitDisabled =
    submitScoreMutation.isPending ||
    hasSubmitted ||
    !roomTimer ||
    roomTimer.status !== "running";

  // Auto-submit when timer hits zero and not already submitted
  useEffect(() => {
    if (
      remainingSeconds === null ||
      remainingSeconds > 0 ||
      hasSubmitted ||
      submitScoreMutation.isPending
    ) {
      return;
    }
    // Trigger auto submission
    submitScores(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, hasSubmitted, submitScoreMutation.isPending]);

  const handleScoreChange = (
    criterion: keyof ScoringCriteria,
    value: number
  ) => {
    if (!canEditScores) return;
    setScores((prev) => ({ ...prev, [criterion]: value }));
  };
  const submitScores = async (isAuto: boolean) => {
    if (!project || !projectId || hasSubmitted) return;

    try {
      if (!isAuto) {
        haptics.impactAsync(ImpactFeedbackStyle.Heavy);
      }

      const submissionData = {
        project_id: projectId,
        design: scores.design,
        completion: scores.completion,
        theme_relevance: scores.theme_relevance,
        idea_innovation: scores.idea_innovation,
        technicality: scores.technology,
        pitching: scores.pitching,
        time: scores.time_management,
      };

      await submitScoreMutation.mutateAsync(submissionData);
      setHasSubmitted(true);

      Toast.show({
        type: "success",
        text1: isAuto ? "Auto-submitted" : "Scores Submitted!",
        text2: `Scored ${project.project_name}`,
      });

      // Navigate to next project only if its round has started
      if (judgeSchedules && scheduleId) {
        const sortedSchedules = [...judgeSchedules].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        const currentIndex = sortedSchedules.findIndex(
          (s) => s.judging_schedule_id === scheduleId
        );

        if (currentIndex >= 0 && currentIndex < sortedSchedules.length - 1) {
          const nextSchedule = sortedSchedules[currentIndex + 1];
          if (nextSchedule.actual_timestamp) {
            router.replace({
              pathname: "/(judge)/projectOverview",
              params: {
                teamId: nextSchedule.team_id,
                scheduleId: nextSchedule.judging_schedule_id,
              },
            });
          } else {
            Toast.show({
              type: "info",
              text1: "Waiting for next round",
              text2: "Admin hasn’t started the next project yet.",
            });
          }
        } else {
          router.replace("/(admin)/judging");
        }
      } else {
        router.replace("/(admin)/judging");
      }
    } catch (error: any) {
      console.error("[ERROR] Score submission failed:", {
        message: error?.message,
        response: error?.response?.data,
        detail: JSON.stringify(error?.response?.data?.detail, null, 2),
        status: error?.response?.status,
        fullError: error,
      });

      let errorMessage = "Unable to submit scores. Please try again.";

      if (error?.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail) && detail.length > 0) {
          errorMessage =
            detail[0]?.msg || detail[0]?.message || JSON.stringify(detail[0]);
        } else if (typeof detail === "string") {
          errorMessage = detail;
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: errorMessage,
      });
    }
  };

  const handleSubmit = () => {
    if (
      !project ||
      !projectId ||
      !roomTimer ||
      roomTimer.status !== "running" ||
      hasSubmitted
    )
      return;

    Alert.alert(
      "Submit Scores?",
      `You are about to submit a score of ${totalScore}/${maxScore} for ${project.project_name}. This action cannot be undone.`,
      [
        {
          text: "Cancel",
          onPress: () => haptics.impactAsync(ImpactFeedbackStyle.Light),
          style: "cancel",
        },
        {
          text: "Submit",
          onPress: () => submitScores(false),
        },
      ]
    );
  };

  const handleGoBack = () => {
    haptics.impactAsync(ImpactFeedbackStyle.Light);
    router.back();
  };

  if (isLoadingJudgeSchedules) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator
            size="large"
            color={isDark ? "#FFFFFF" : "#002A5C"}
          />
          <Text
            className={cn("mt-4 text-base font-pp", themeStyles.secondaryText)}
          >
            Loading scorecard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isJudgeSchedulesError || !currentSchedule || !project || !projectId) {
    return (
      <SafeAreaView className={cn("flex-1", themeStyles.background)}>
        <View className="flex-1 justify-center items-center px-6">
          <Text
            className={cn(
              "text-lg font-onest-bold mb-2",
              themeStyles.primaryText
            )}
          >
            Project Not Found
          </Text>
          <Text
            className={cn(
              "text-base font-pp text-center",
              themeStyles.secondaryText
            )}
          >
            Unable to load project details. Please try again.
          </Text>
          <Pressable
            onPress={handleGoBack}
            className={cn(
              "mt-6 px-6 py-3 rounded-xl",
              isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
            )}
          >
            <Text
              className={cn(
                "text-base font-onest-bold",
                isDark ? "text-black" : "text-white"
              )}
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const roundInfo = getRoundInfo();
  const visibleTags = showAllTags
    ? project.categories
    : project.categories.slice(0, 3);

  return (
    <SafeAreaView className={cn("flex-1", themeStyles.background)}>
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="mt-6 mb-4">
          <Pressable onPress={handleGoBack}>
            <ChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
          </Pressable>
        </View>

        {/* Project Name and Round */}
        <View className="flex-row justify-between items-start mb-4">
          <Text
            className={cn(
              "text-2xl font-onest-bold flex-1",
              themeStyles.primaryText
            )}
          >
            {project.project_name}
          </Text>
          <Text
            className={cn("text-sm font-pp ml-2", themeStyles.secondaryText)}
          >
            Round {roundInfo.currentRound} ({roundInfo.currentRound}/
            {roundInfo.totalRounds})
          </Text>
        </View>

        {/* Timer / status */}
        <View className="mb-4">
          {roomTimer ? (
            <View className="flex-row items-center justify-between">
              <Text
                className={cn("text-sm font-pp", themeStyles.secondaryText)}
              >
                Time remaining
              </Text>
              <Text
                className={cn(
                  "text-2xl font-onest-bold",
                  themeStyles.primaryText
                )}
              >
                {remainingSeconds !== null
                  ? `${Math.floor((remainingSeconds || 0) / 60)
                      .toString()
                      .padStart(2, "0")}:${((remainingSeconds || 0) % 60)
                      .toString()
                      .padStart(2, "0")}`
                  : "--:--"}
              </Text>
            </View>
          ) : (
            <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
              Waiting for admin to start the timer for this room.
            </Text>
          )}
          {timerStatusLabel && (
            <Text
              className={cn("text-xs font-pp mt-1", themeStyles.secondaryText)}
            >
              {timerStatusLabel}
            </Text>
          )}
          {hasSubmitted && (
            <Text
              className={cn("text-sm font-pp mt-2", themeStyles.secondaryText)}
            >
              Scoring completed. Waiting for next round.
            </Text>
          )}
          {isFetchingJudgeSchedules && (
            <Text
              className={cn("text-xs font-pp mt-1", themeStyles.secondaryText)}
            >
              Syncing latest timer...
            </Text>
          )}
        </View>

        {/* Categories/Tags with See More */}
        {project.categories && project.categories.length > 0 && (
          <View className="mb-6">
            <View className="flex-row flex-wrap gap-2 mb-2">
              {visibleTags.map((category, index) => (
                <View
                  key={index}
                  className={cn(
                    "px-3 py-1.5 rounded-full",
                    isDark ? "bg-[#303030]" : "bg-gray-200"
                  )}
                >
                  <Text
                    className={cn("text-sm font-pp", themeStyles.primaryText)}
                  >
                    {category}
                  </Text>
                </View>
              ))}
            </View>
            {project.categories.length > 3 && (
              <Pressable
                onPress={() => {
                  haptics.impactAsync(ImpactFeedbackStyle.Light);
                  setShowAllTags(!showAllTags);
                }}
              >
                <Text
                  className={cn(
                    "text-sm font-pp",
                    isDark ? "text-[#75EDEF]" : "text-[#132B38]"
                  )}
                >
                  {showAllTags ? "See Less" : "See More"}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Total Score Display */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center">
            <Text
              className={cn(
                "text-4xl font-onest-bold",
                themeStyles.primaryText
              )}
            >
              {totalScore}/{maxScore}
            </Text>
          </View>
        </View>

        {/* Scoring Sliders */}
        <View className="mb-6">
          <ScoringSlider
            label="Design *"
            value={scores.design}
            onChange={(val) => handleScoreChange("design", val)}
            criteriaInfo={SCORING_CRITERIA_INFO.design}
            min={0}
            max={3}
            disabled={isSliderDisabled}
          />
          <ScoringSlider
            label="Completion"
            value={scores.completion}
            onChange={(val) => handleScoreChange("completion", val)}
            criteriaInfo={SCORING_CRITERIA_INFO.completion}
            min={0}
            max={4}
            disabled={isSliderDisabled}
          />
          <ScoringSlider
            label="Theme Relevance"
            value={scores.theme_relevance}
            onChange={(val) => handleScoreChange("theme_relevance", val)}
            criteriaInfo={SCORING_CRITERIA_INFO.theme_relevance}
            min={0}
            max={3}
            disabled={isSliderDisabled}
          />
          <ScoringSlider
            label="Idea & Innovation"
            value={scores.idea_innovation}
            onChange={(val) => handleScoreChange("idea_innovation", val)}
            criteriaInfo={SCORING_CRITERIA_INFO.idea_innovation}
            min={0}
            max={5}
            disabled={isSliderDisabled}
          />
          <ScoringSlider
            label="Technicality *"
            value={scores.technology}
            onChange={(val) => handleScoreChange("technology", val)}
            criteriaInfo={SCORING_CRITERIA_INFO.technology}
            min={0}
            max={5}
            disabled={isSliderDisabled}
          />
          <ScoringSlider
            label="Pitching *"
            value={scores.pitching}
            onChange={(val) => handleScoreChange("pitching", val)}
            criteriaInfo={SCORING_CRITERIA_INFO.pitching}
            min={0}
            max={5}
            disabled={isSliderDisabled}
          />
          <ScoringSlider
            label="Time"
            value={scores.time_management}
            onChange={(val) => handleScoreChange("time_management", val)}
            criteriaInfo={SCORING_CRITERIA_INFO.time_management}
            min={0}
            max={2}
            disabled={isSliderDisabled}
          />
        </View>

        {/* Notes */}
        <View className="mb-6">
          <Text
            className={cn(
              "text-lg font-onest-bold mb-3",
              themeStyles.primaryText
            )}
          >
            Notes
          </Text>
          <TextInput
            className={cn(
              "p-4 rounded-xl text-base font-pp min-h-[120px]",
              isDark ? "bg-[#303030] text-white" : "bg-gray-100 text-black"
            )}
            placeholder="Add feedback for the team..."
            placeholderTextColor={isDark ? "#888" : "#666"}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            editable={canEditScores}
          />
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={submitDisabled}
          className={cn(
            "py-4 rounded-xl mb-8",
            isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
          )}
          style={{
            opacity: submitDisabled ? 0.6 : 1,
          }}
        >
          <Text
            className={cn(
              "text-center text-lg font-onest-bold",
              isDark ? "text-black" : "text-white"
            )}
          >
            {hasSubmitted
              ? "Submitted"
              : submitScoreMutation.isPending
                ? "Submitting..."
                : "Submit"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Scorecard;
