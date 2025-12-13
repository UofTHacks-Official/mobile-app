import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import { Info } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { Slider } from "@miblanchard/react-native-slider";
import Toast from "react-native-toast-message";

interface ScoringSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltipText: string;
  min?: number;
  max?: number;
  step?: number;
}

export const ScoringSlider = ({
  label,
  value,
  onChange,
  tooltipText,
  min = 0,
  max = 3,
  step = 1,
}: ScoringSliderProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  const handleInfoPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Toast.show({
      type: "info",
      text1: label,
      text2: tooltipText,
      visibilityTime: 3000,
    });
  };

  const handleValueChange = (values: number | number[]) => {
    const newValue = Array.isArray(values) ? values[0] : values;
    const roundedValue = Math.round(newValue);
    if (roundedValue !== value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(roundedValue);
    }
  };

  return (
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
      />
    </View>
  );
};
