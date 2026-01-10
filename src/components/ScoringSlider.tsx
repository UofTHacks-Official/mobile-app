import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import { haptics, ImpactFeedbackStyle } from "@/utils/haptics";
import { Info } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Slider } from "@miblanchard/react-native-slider";

interface CriteriaInfo {
  title: string;
  maxScore: number;
  description: string;
  breakdown: string;
}

interface ScoringSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  criteriaInfo: CriteriaInfo;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export const ScoringSlider = ({
  label,
  value,
  onChange,
  criteriaInfo,
  min = 0,
  max = 3,
  step = 1,
  disabled = false,
}: ScoringSliderProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [modalVisible, setModalVisible] = useState(false);

  const handleInfoPress = () => {
    haptics.impactAsync(ImpactFeedbackStyle.Light);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    haptics.impactAsync(ImpactFeedbackStyle.Light);
    setModalVisible(false);
  };

  const handleValueChange = (values: number | number[]) => {
    if (disabled) return;
    const newValue = Array.isArray(values) ? values[0] : values;
    const roundedValue = Math.round(newValue);
    if (roundedValue !== value) {
      haptics.impactAsync(ImpactFeedbackStyle.Light);
      onChange(roundedValue);
    }
  };

  return (
    <>
      <View className="mb-6">
        {/* Label and Value */}
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center gap-2">
            <Text className={cn("text-base font-pp", themeStyles.primaryText)}>
              {label}
            </Text>
            <Pressable onPress={handleInfoPress}>
              <Info size={16} color={isDark ? "#888" : "#666"} />
            </Pressable>
          </View>
          <Text className={cn("text-base font-pp", themeStyles.secondaryText)}>
            {value}/{max}
          </Text>
        </View>

        {/* Slider */}
        <View style={{ opacity: disabled ? 0.5 : 1 }}>
          <Slider
            value={value}
            onValueChange={handleValueChange}
            minimumValue={min}
            maximumValue={max}
            step={step}
            minimumTrackTintColor={isDark ? "#75EDEF" : "#132B38"}
            maximumTrackTintColor={isDark ? "#333" : "#DDD"}
            thumbTintColor={isDark ? "#75EDEF" : "#132B38"}
            containerStyle={{ height: 40 }}
            disabled={disabled}
          />
        </View>
      </View>

      {/* Criteria Info Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/50"
          onPress={handleCloseModal}
        >
          <Pressable
            className={cn(
              "w-11/12 max-w-lg rounded-2xl p-6",
              isDark ? "bg-[#303030]" : "bg-white"
            )}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="mb-4">
              <Text
                className={cn(
                  "text-xl font-onest-bold",
                  themeStyles.primaryText
                )}
              >
                {criteriaInfo.title}
              </Text>
            </View>

            {/* Description */}
            <Text
              className={cn("text-sm font-pp mb-4", themeStyles.secondaryText)}
            >
              {criteriaInfo.description}
            </Text>

            {/* Breakdown */}
            <View
              className={cn(
                "rounded-xl p-4",
                isDark ? "bg-[#303030]" : "bg-gray-100"
              )}
            >
              <Text
                className={cn(
                  "text-sm font-onest-bold mb-2",
                  themeStyles.primaryText
                )}
              >
                Scoring Breakdown
              </Text>
              <ScrollView style={{ maxHeight: 300 }}>
                <Text
                  className={cn(
                    "text-sm font-pp leading-6",
                    themeStyles.primaryText
                  )}
                >
                  {criteriaInfo.breakdown}
                </Text>
              </ScrollView>
            </View>

            {/* Close Button */}
            <Pressable
              onPress={handleCloseModal}
              className={cn(
                "mt-6 py-3 rounded-xl",
                isDark ? "bg-[#75EDEF]" : "bg-[#132B38]"
              )}
            >
              <Text
                className={cn(
                  "text-center text-base font-onest-bold",
                  isDark ? "text-black" : "text-white"
                )}
              >
                Close
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};
