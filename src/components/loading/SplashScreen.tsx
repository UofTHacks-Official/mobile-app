import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import LottieView from "lottie-react-native";
import { View } from "react-native";

export function CustomSplashScreen() {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);

  return (
    <View
      className={cn(
        "flex-1 justify-center items-center",
        themeStyles.background
      )}
    >
      <LottieView
        source={require("../../../assets/lottie/moose.json")}
        autoPlay
        loop
        style={{
          width: 300,
          height: 300,
        }}
      />
    </View>
  );
}

// import { useTheme } from "@/context/themeContext";
// import { cn, getThemeStyles } from "@/utils/theme";
// import { useEffect, useRef } from "react";
// import { Animated, Easing, Image, View } from "react-native";

// export function CustomSplashScreen() {
//   const { isDark } = useTheme();
//   const themeStyles = getThemeStyles(isDark);

//   // Animation values
//   const scaleAnim = useRef(new Animated.Value(0.8)).current;
//   const opacityAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     // Create a sequence of animations
//     const animationSequence = Animated.sequence([
//       // Fade in and scale up
//       Animated.parallel([
//         Animated.timing(opacityAnim, {
//           toValue: 1,
//           duration: 800,
//           easing: Easing.out(Easing.quad),
//           useNativeDriver: true,
//         }),
//         Animated.timing(scaleAnim, {
//           toValue: 1,
//           duration: 800,
//           easing: Easing.out(Easing.back(1.2)),
//           useNativeDriver: true,
//         }),
//       ]),
//       // Gentle pulse animation
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(scaleAnim, {
//             toValue: 1.05,
//             duration: 1000,
//             easing: Easing.inOut(Easing.sin),
//             useNativeDriver: true,
//           }),
//           Animated.timing(scaleAnim, {
//             toValue: 1,
//             duration: 1000,
//             easing: Easing.inOut(Easing.sin),
//             useNativeDriver: true,
//           }),
//         ])
//       ),
//     ]);

//     animationSequence.start();
//   }, []);

//   return (
//     <View
//       className={cn(
//         "flex-1 justify-center items-center",
//         themeStyles.background
//       )}
//     >
//       <Animated.View
//         style={{
//           opacity: opacityAnim,
//           transform: [{ scale: scaleAnim }],
//         }}
//       >
//         <Image
//           source={require("../../../assets/images/icon.png")}
//           style={{
//             width: 200,
//             height: 200,
//             resizeMode: "contain",
//           }}
//         />
//       </Animated.View>
//     </View>
//   );
// }
