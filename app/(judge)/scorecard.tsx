import { ScoringSlider } from "@/components/ScoringSlider";
import { useTheme } from "@/context/themeContext";
import { useProject } from "@/queries/project";
import { useSubmitScore } from "@/queries/scoring";
import { useAllJudgingSchedules } from "@/queries/judging";
import { ScoringCriteria, SCORING_CRITERIA_INFO } from "@/types/scoring";
import { cn, getThemeStyles } from "@/utils/theme";
import { getSponsorPin, getJudgeId } from "@/utils/tokens/secureStorage";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
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

const Scorecard = () => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const params = useLocalSearchParams();

  const [pin, setPin] = useState<number | null>(null);
  const [judgeId, setJudgeId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [scheduleId, setScheduleId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);

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
      const storedPin = await getSponsorPin();
      const storedJudgeId = await getJudgeId();
      setPin(storedPin);
      setJudgeId(storedJudgeId);

      if (params.projectId && typeof params.projectId === "string") {
        setProjectId(parseInt(params.projectId));
      }
      if (params.teamId && typeof params.teamId === "string") {
        setTeamId(parseInt(params.teamId));
      }
      if (params.scheduleId && typeof params.scheduleId === "string") {
        setScheduleId(parseInt(params.scheduleId));
      }
    };
    loadData();
  }, [params]);

  const { data: project, isLoading } = useProject(pin, teamId);
  const { data: allSchedules } = useAllJudgingSchedules();

  // Calculate total score
  const totalScore = Object.values(scores).reduce((sum, val) => sum + val, 0);
  const maxScore = 21; // 7 criteria × 3 points

  // Calculate round information
  const getRoundInfo = () => {
    if (!allSchedules || !judgeId || !scheduleId) {
      return { currentRound: 1, totalRounds: 1 };
    }

    const judgeSchedules = allSchedules.filter((s) => s.judge_id === judgeId);
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

  const handleScoreChange = (
    criterion: keyof ScoringCriteria,
    value: number
  ) => {
    setScores((prev) => ({ ...prev, [criterion]: value }));
  };

  const handleSubmit = () => {
    if (!project || !projectId) return;

    // Show confirmation alert
    Alert.alert(
      "Submit Scores?",
      `You are about to submit a score of ${totalScore}/${maxScore} for ${project.project_name}. This action cannot be undone.`,
      [
        {
          text: "Cancel",
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
          style: "cancel",
        },
        {
          text: "Submit",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            try {
              await submitScoreMutation.mutateAsync({
                project_id: projectId,
                score: totalScore,
                max_score: 100, // Backend may scale this
                category: project.categories[0] || "General",
                feedback: notes,
              });

              Toast.show({
                type: "success",
                text1: "Scores Submitted!",
                text2: `Successfully scored ${project.project_name}`,
              });

              // Navigate back to judging schedule
              router.replace("/(admin)/judging");
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: "Submission Failed",
                text2:
                  error?.message ||
                  "Unable to submit scores. Please try again.",
              });
            }
          },
        },
      ]
    );
  };

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (isLoading || !project) {
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

        {/* Categories/Tags with See More */}
        {project.categories && project.categories.length > 0 && (
          <View className="mb-6">
            <View className="flex-row flex-wrap gap-2 mb-2">
              {visibleTags.map((category, index) => (
                <View
                  key={index}
                  className={cn(
                    "px-3 py-1.5 rounded-full",
                    isDark ? "bg-[#1a1a2e]" : "bg-gray-200"
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
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
            tooltipText={SCORING_CRITERIA_INFO.design}
          />
          <ScoringSlider
            label="Completion"
            value={scores.completion}
            onChange={(val) => handleScoreChange("completion", val)}
            tooltipText={SCORING_CRITERIA_INFO.completion}
          />
          <ScoringSlider
            label="Theme Relevance"
            value={scores.theme_relevance}
            onChange={(val) => handleScoreChange("theme_relevance", val)}
            tooltipText={SCORING_CRITERIA_INFO.theme_relevance}
          />
          <ScoringSlider
            label="Idea & Innovation"
            value={scores.idea_innovation}
            onChange={(val) => handleScoreChange("idea_innovation", val)}
            tooltipText={SCORING_CRITERIA_INFO.idea_innovation}
          />
          <ScoringSlider
            label="Technology"
            value={scores.technology}
            onChange={(val) => handleScoreChange("technology", val)}
            tooltipText={SCORING_CRITERIA_INFO.technology}
          />
          <ScoringSlider
            label="Pitching"
            value={scores.pitching}
            onChange={(val) => handleScoreChange("pitching", val)}
            tooltipText={SCORING_CRITERIA_INFO.pitching}
          />
          <ScoringSlider
            label="Time"
            value={scores.time_management}
            onChange={(val) => handleScoreChange("time_management", val)}
            tooltipText={SCORING_CRITERIA_INFO.time_management}
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
              isDark ? "bg-[#1a1a2e] text-white" : "bg-gray-100 text-black"
            )}
            placeholder="Add feedback for the team..."
            placeholderTextColor={isDark ? "#888" : "#666"}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={submitScoreMutation.isPending}
          className={cn(
            "py-4 rounded-xl mb-8",
            isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
          )}
          style={{ opacity: submitScoreMutation.isPending ? 0.6 : 1 }}
        >
          <Text
            className={cn(
              "text-center text-lg font-onest-bold",
              isDark ? "text-black" : "text-white"
            )}
          >
            {submitScoreMutation.isPending ? "Submitting..." : "Submit"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Scorecard;
