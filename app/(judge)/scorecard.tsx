import { ScoringSlider } from "@/components/ScoringSlider";
import { useTheme } from "@/context/themeContext";
import {
  computeRemainingSecondsFromTimer,
  useTimer,
} from "@/context/timerContext";
import { isFeatureEnabled } from "@/config/featureFlags";
import { useJudgeSchedules } from "@/queries/judging";
import { useSubmitScore } from "@/queries/scoring";
import { SCORING_CRITERIA_INFO, ScoringCriteria } from "@/types/scoring";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import { formatLocationForDisplay } from "@/utils/judging";
import { cn, getThemeStyles } from "@/utils/theme";
import {
  getJudgeId,
  getProjectScores,
  storeProjectScores,
} from "@/utils/tokens/secureStorage";
import { useFocusEffect } from "@react-navigation/native";
import { Href, router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const Scorecard = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const params = useLocalSearchParams();
  const timerContext = useTimer();
  const timerSyncEnabled = isFeatureEnabled("ENABLE_JUDGE_TIMERS");

  const [judgeId, setJudgeId] = useState<number | null>(null);
  const [scheduleId, setScheduleId] = useState<number | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [nowTs, setNowTs] = useState(Date.now());
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showWebSubmitConfirm, setShowWebSubmitConfirm] = useState(false);

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
  const projectNameForDisplay = project?.project_name || "this project";
  const projectId = useMemo(() => {
    if (project?.project_id) return project.project_id;
    if (params.projectId && typeof params.projectId === "string") {
      return parseInt(params.projectId);
    }
    return null;
  }, [params.projectId, project?.project_id]);

  // Load saved scores when component mounts or project changes
  useEffect(() => {
    const loadSavedScores = async () => {
      if (!judgeId || !projectId) return;

      const savedScores = await getProjectScores(judgeId, projectId);
      if (savedScores) {
        setScores(savedScores);
        setHasSubmitted(true);
      } else {
        // Reset to default scores if no saved scores found
        setScores({
          design: 0,
          completion: 0,
          theme_relevance: 0,
          idea_innovation: 0,
          technology: 0,
          pitching: 0,
          time_management: 0,
        });
        setHasSubmitted(false);
      }
    };

    loadSavedScores();
  }, [judgeId, projectId]);

  const locationName = currentSchedule
    ? formatLocationForDisplay(currentSchedule.location)
    : "";

  // Note: Room timer is now managed by WebSocket listener (useJudgeTimerWebSocket)
  // No need to hydrate here - the WebSocket will update roomTimers in real-time

  // Calculate total score
  const totalScore = Object.values(scores).reduce((sum, val) => sum + val, 0);
  const maxScore = 27; // Design(3) + Completion(4) + Theme(3) + Innovation(5) + Tech(5) + Pitching(5) + Time(2)
  const submitConfirmationMessage = `You are about to submit a score of ${totalScore}/${maxScore} for ${projectNameForDisplay}. This action cannot be undone.`;

  const roomTimer =
    timerSyncEnabled && locationName
      ? timerContext.roomTimers[locationName]
      : undefined;
  const remainingSeconds = timerSyncEnabled
    ? computeRemainingSecondsFromTimer(roomTimer, nowTs)
    : null;
  const timerStatusLabel =
    timerSyncEnabled && roomTimer?.status === "paused"
      ? "Timer paused by admin"
      : timerSyncEnabled && roomTimer?.status === "stopped"
        ? "Timer ended by admin"
        : null;
  const canEditScores = timerSyncEnabled
    ? !!roomTimer && roomTimer.status === "running" && !hasSubmitted
    : !hasSubmitted;
  const isSliderDisabled = timerSyncEnabled ? !canEditScores : hasSubmitted; // Lock sliders when timer is paused/stopped or scores are submitted
  const submitDisabled = timerSyncEnabled
    ? submitScoreMutation.isPending ||
      hasSubmitted ||
      !roomTimer ||
      roomTimer.status !== "running"
    : submitScoreMutation.isPending || hasSubmitted;

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
    if (!project || !projectId || hasSubmitted || !judgeId) return;

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

      // Save scores to local storage
      await storeProjectScores(judgeId, projectId, scores);

      Toast.show({
        type: "success",
        text1: isAuto ? "Auto-submitted" : "Scores Submitted!",
        text2: `Scored ${project.project_name}`,
      });

      // Only navigate if this is an auto-submit (timer expired)
      // If submitted early, keep judge on scorecard until timer expires
      if (isAuto) {
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
            router.replace({
              pathname: "/(judge)/projectOverview",
              params: {
                teamId: nextSchedule.team_id,
                scheduleId: nextSchedule.judging_schedule_id,
              },
            });
          } else {
            router.replace("/(judge)/complete" as Href);
          }
        } else {
          router.replace("/(judge)/complete" as Href);
        }
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
      hasSubmitted ||
      (timerSyncEnabled && (!roomTimer || roomTimer.status !== "running"))
    )
      return;

    const confirmationMessage = `You are about to submit a score of ${totalScore}/${maxScore} for ${projectNameForDisplay}. This action cannot be undone.`;

    if (Platform.OS === "web") {
      setShowWebSubmitConfirm(true);
      return;
    }

    Alert.alert("Submit Scores?", confirmationMessage, [
      {
        text: "Cancel",
        onPress: () => haptics.impactAsync(ImpactFeedbackStyle.Light),
        style: "cancel",
      },
      {
        text: "Submit",
        onPress: () => submitScores(false),
      },
    ]);
  };

  const handleCancelSubmit = () => {
    setShowWebSubmitConfirm(false);
    haptics.impactAsync(ImpactFeedbackStyle.Light);
  };

  const handleConfirmSubmit = () => {
    setShowWebSubmitConfirm(false);
    submitScores(false);
  };

  const submitConfirmationModal = (
    <Modal
      animationType="fade"
      transparent
      visible={showWebSubmitConfirm}
      onRequestClose={handleCancelSubmit}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View
          className={cn(
            "w-full p-6 rounded-2xl",
            isDark ? "bg-uoft_dark_mode_card" : "bg-white"
          )}
          style={{ maxWidth: 480 }}
        >
          <Text
            className={cn(
              "text-xl mb-2 font-onest-bold",
              themeStyles.primaryText
            )}
          >
            Submit Scores?
          </Text>
          <Text className={cn("text-base mb-6", themeStyles.secondaryText)}>
            {submitConfirmationMessage}
          </Text>
          <View className="flex-row justify-end gap-3">
            <Pressable
              onPress={handleCancelSubmit}
              className="px-4 py-3 rounded-xl border border-gray-300"
            >
              <Text className={cn("text-base font-onest-bold text-center")}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleConfirmSubmit}
              className={cn(
                "px-4 py-3 rounded-xl",
                isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
              )}
            >
              <Text
                className={cn(
                  "text-base font-onest-bold text-center",
                  isDark ? "text-black" : "text-white"
                )}
              >
                Submit
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

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
        {submitConfirmationModal}
      </SafeAreaView>
    );
  }

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

        {/* Project Name */}
        <View className="mb-4">
          <Text
            className={cn("text-2xl font-onest-bold", themeStyles.primaryText)}
          >
            {project.project_name}
          </Text>
        </View>

        {/* Timer / status */}
        <View className="mb-4">
          {timerSyncEnabled ? (
            roomTimer ? (
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
              <Text
                className={cn("text-sm font-pp", themeStyles.secondaryText)}
              >
                Waiting for admin to start the timer for this room.
              </Text>
            )
          ) : (
            <Text className={cn("text-sm font-pp", themeStyles.secondaryText)}>
              Timer sync is off; you can score whenever you are ready.
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
            label="Design"
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
            label="Technicality"
            value={scores.technology}
            onChange={(val) => handleScoreChange("technology", val)}
            criteriaInfo={SCORING_CRITERIA_INFO.technology}
            min={0}
            max={5}
            disabled={isSliderDisabled}
          />
          <ScoringSlider
            label="Pitching"
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
      {submitConfirmationModal}
    </SafeAreaView>
  );
};

export default Scorecard;
