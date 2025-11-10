import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

interface AnimatedBellProps {
  color: string;
  size: number;
}

export const AnimatedBell = ({ color, size }: AnimatedBellProps) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Bell ringing animation matching the lucide-animated pattern
    // rotate: [0, -10, 10, -10, 0]
    rotation.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(-10, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(10, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(-10, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000 }) // Pause before next ring
      ),
      -1, // Infinite repeat
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </Svg>
    </Animated.View>
  );
};
