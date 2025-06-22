import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import {
  FONTS,
  FONT_STYLES,
  getOnestFont,
  getOpenSansCondensedFont,
  getOpenSansFont,
  getOpenSansSemiCondensedFont,
} from "../utils/fonts";

export default function FontExample() {
  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <ScrollView className="flex-1 p-4">
        <View className="flex flex-row items-center px-4 pt-4 pb-12">
          <Pressable onPress={() => router.back()}>
            <Icon name="chevron-left" size={28} />
          </Pressable>
          <Text className="text-lg font-onest text-black flex-1 text-center">
            Font Exmaples
          </Text>
        </View>
        {/* Onest Fonts - Using Tailwind Classes */}
        <View className="mb-8 pb-5 border-b border-gray-200">
          <Text className="text-xl font-semibold text-uoft_black mb-4">
            Onest Fonts (Tailwind Classes)
          </Text>
          <Text className="font-onest-thin text-lg mb-2 text-uoft_black">
            Onest Thin - The quick brown fox
          </Text>
          <Text className="font-onest-extralight text-lg mb-2 text-uoft_black">
            Onest ExtraLight - The quick brown fox
          </Text>
          <Text className="font-onest-light text-lg mb-2 text-uoft_black">
            Onest Light - The quick brown fox
          </Text>
          <Text className="font-onest text-lg mb-2 text-uoft_black">
            Onest Regular - The quick brown fox
          </Text>
          <Text className="font-onest-medium text-lg mb-2 text-uoft_black">
            Onest Medium - The quick brown fox
          </Text>
          <Text className="font-onest-semibold text-lg mb-2 text-uoft_black">
            Onest SemiBold - The quick brown fox
          </Text>
          <Text className="font-onest-bold text-lg mb-2 text-uoft_black">
            Onest Bold - The quick brown fox
          </Text>
          <Text className="font-onest-extrabold text-lg mb-2 text-uoft_black">
            Onest ExtraBold - The quick brown fox
          </Text>
          <Text className="font-onest-black text-lg mb-2 text-uoft_black">
            Onest Black - The quick brown fox
          </Text>
        </View>

        {/* Open Sans Fonts - Using Tailwind Classes */}
        <View className="mb-8 pb-5 border-b border-gray-200">
          <Text className="text-xl font-semibold text-uoft_black mb-4">
            Open Sans Fonts (Tailwind Classes)
          </Text>
          <Text className="font-opensans-light text-lg mb-2 text-uoft_black">
            Open Sans Light - The quick brown fox
          </Text>
          <Text className="font-opensans text-lg mb-2 text-uoft_black">
            Open Sans Regular - The quick brown fox
          </Text>
          <Text className="font-opensans-medium text-lg mb-2 text-uoft_black">
            Open Sans Medium - The quick brown fox
          </Text>
          <Text className="font-opensans-semibold text-lg mb-2 text-uoft_black">
            Open Sans SemiBold - The quick brown fox
          </Text>
          <Text className="font-opensans-bold text-lg mb-2 text-uoft_black">
            Open Sans Bold - The quick brown fox
          </Text>
          <Text className="font-opensans-extrabold text-lg mb-2 text-uoft_black">
            Open Sans ExtraBold - The quick brown fox
          </Text>
        </View>

        {/* Open Sans Condensed Fonts - Using Tailwind Classes */}
        <View className="mb-8 pb-5 border-b border-gray-200">
          <Text className="text-xl font-semibold text-uoft_black mb-4">
            Open Sans Condensed Fonts (Tailwind Classes)
          </Text>
          <Text className="font-opensans-condensed-light text-lg mb-2 text-uoft_black">
            Open Sans Condensed Light - The quick brown fox
          </Text>
          <Text className="font-opensans-condensed text-lg mb-2 text-uoft_black">
            Open Sans Condensed Regular - The quick brown fox
          </Text>
          <Text className="font-opensans-condensed-medium text-lg mb-2 text-uoft_black">
            Open Sans Condensed Medium - The quick brown fox
          </Text>
          <Text className="font-opensans-condensed-semibold text-lg mb-2 text-uoft_black">
            Open Sans Condensed SemiBold - The quick brown fox
          </Text>
          <Text className="font-opensans-condensed-bold text-lg mb-2 text-uoft_black">
            Open Sans Condensed Bold - The quick brown fox
          </Text>
          <Text className="font-opensans-condensed-extrabold text-lg mb-2 text-uoft_black">
            Open Sans Condensed ExtraBold - The quick brown fox
          </Text>
        </View>

        {/* Open Sans SemiCondensed Fonts - Using Tailwind Classes */}
        <View className="mb-8 pb-5 border-b border-gray-200">
          <Text className="text-xl font-semibold text-uoft_black mb-4">
            Open Sans SemiCondensed Fonts (Tailwind Classes)
          </Text>
          <Text className="font-opensans-semicondensed-light text-lg mb-2 text-uoft_black">
            Open Sans SemiCondensed Light - The quick brown fox
          </Text>
          <Text className="font-opensans-semicondensed text-lg mb-2 text-uoft_black">
            Open Sans SemiCondensed Regular - The quick brown fox
          </Text>
          <Text className="font-opensans-semicondensed-medium text-lg mb-2 text-uoft_black">
            Open Sans SemiCondensed Medium - The quick brown fox
          </Text>
          <Text className="font-opensans-semicondensed-semibold text-lg mb-2 text-uoft_black">
            Open Sans SemiCondensed SemiBold - The quick brown fox
          </Text>
          <Text className="font-opensans-semicondensed-bold text-lg mb-2 text-uoft_black">
            Open Sans SemiCondensed Bold - The quick brown fox
          </Text>
          <Text className="font-opensans-semicondensed-extrabold text-lg mb-2 text-uoft_black">
            Open Sans SemiCondensed ExtraBold - The quick brown fox
          </Text>
        </View>

        {/* Fonts using StyleSheet */}
        <View className="mb-8 pb-5 border-b border-gray-200">
          <Text className="text-xl font-semibold text-uoft_black mb-4">
            Fonts using StyleSheet
          </Text>
          <Text
            style={[FONT_STYLES.onest.thin]}
            className="text-base mb-2 text-uoft_black"
          >
            Onest Thin (StyleSheet) - The quick brown fox
          </Text>
          <Text
            style={[FONT_STYLES.onest.bold]}
            className="text-base mb-2 text-uoft_black"
          >
            Onest Bold (StyleSheet) - The quick brown fox
          </Text>
          <Text
            style={[FONT_STYLES.opensans.medium]}
            className="text-base mb-2 text-uoft_black"
          >
            Open Sans Medium (StyleSheet) - The quick brown fox
          </Text>
          <Text
            style={[FONT_STYLES.opensansCondensed.bold]}
            className="text-base mb-2 text-uoft_black"
          >
            Open Sans Condensed Bold (StyleSheet) - The quick brown fox
          </Text>
          <Text
            style={[FONT_STYLES.opensansSemiCondensed.semibold]}
            className="text-base mb-2 text-uoft_black"
          >
            Open Sans SemiCondensed SemiBold (StyleSheet) - The quick brown fox
          </Text>
        </View>

        {/* Fonts using Utility Functions */}
        <View className="mb-8 pb-5 border-b border-gray-200">
          <Text className="text-xl font-semibold text-uoft_black mb-4">
            Fonts using Utility Functions
          </Text>
          <Text
            style={{ fontFamily: getOnestFont("extralight") }}
            className="text-base mb-2 text-uoft_black"
          >
            Onest ExtraLight (Utility) - The quick brown fox
          </Text>
          <Text
            style={{ fontFamily: getOnestFont("semibold") }}
            className="text-base mb-2 text-uoft_black"
          >
            Onest SemiBold (Utility) - The quick brown fox
          </Text>
          <Text
            style={{ fontFamily: getOpenSansFont("extrabold") }}
            className="text-base mb-2 text-uoft_black"
          >
            Open Sans ExtraBold (Utility) - The quick brown fox
          </Text>
          <Text
            style={{ fontFamily: getOpenSansCondensedFont("medium") }}
            className="text-base mb-2 text-uoft_black"
          >
            Open Sans Condensed Medium (Utility) - The quick brown fox
          </Text>
          <Text
            style={{ fontFamily: getOpenSansSemiCondensedFont("bold") }}
            className="text-base mb-2 text-uoft_black"
          >
            Open Sans SemiCondensed Bold (Utility) - The quick brown fox
          </Text>
        </View>

        {/* Variable Fonts */}
        <View className="mb-8 pb-5 border-b border-gray-200">
          <Text className="text-xl font-semibold text-uoft_black mb-4">
            Variable Fonts
          </Text>
          <Text
            style={[{ fontFamily: FONTS.OPENSANS_VARIABLE, fontWeight: "300" }]}
            className="text-base mb-2 text-uoft_black"
          >
            Open Sans Variable Light (300) - The quick brown fox
          </Text>
          <Text
            style={[{ fontFamily: FONTS.OPENSANS_VARIABLE, fontWeight: "400" }]}
            className="text-base mb-2 text-uoft_black"
          >
            Open Sans Variable Regular (400) - The quick brown fox
          </Text>
          <Text
            style={[{ fontFamily: FONTS.OPENSANS_VARIABLE, fontWeight: "600" }]}
            className="text-base mb-2 text-uoft_black"
          >
            Open Sans Variable SemiBold (600) - The quick brown fox
          </Text>
          <Text
            style={[{ fontFamily: FONTS.OPENSANS_VARIABLE, fontWeight: "700" }]}
            className="text-base mb-2 text-uoft_black"
          >
            Open Sans Variable Bold (700) - The quick brown fox
          </Text>
          <Text
            style={[
              {
                fontFamily: FONTS.OPENSANS_ITALIC_VARIABLE,
                fontWeight: "400",
                fontStyle: "italic",
              },
            ]}
            className="text-base mb-2 text-uoft_black"
          >
            Open Sans Italic Variable Regular (400) - The quick brown fox
          </Text>
        </View>

        {/* Usage Examples */}
        <View className="mb-8 pb-5 border-b border-gray-200">
          <Text className="text-xl font-semibold text-uoft_black mb-4">
            Usage Examples
          </Text>

          {/* Headings */}
          <Text
            style={[FONT_STYLES.onest.bold]}
            className="text-2xl mb-2 text-uoft_primary_blue"
          >
            Heading 1 - Onest Bold
          </Text>
          <Text
            style={[FONT_STYLES.onest.medium]}
            className="text-xl mb-2 text-uoft_primary_blue"
          >
            Heading 2 - Onest Medium
          </Text>
          <Text
            style={[FONT_STYLES.opensans.semibold]}
            className="text-xl mb-2 text-uoft_primary_blue"
          >
            Heading 3 - Open Sans SemiBold
          </Text>

          {/* Body Text */}
          <Text
            style={[FONT_STYLES.opensans.regular]}
            className="text-base leading-6 mb-3 text-uoft_black"
          >
            This is body text using Open Sans Regular. It's perfect for reading
            long paragraphs and general content.
          </Text>

          {/* Captions */}
          <Text
            style={[FONT_STYLES.opensansCondensed.regular]}
            className="text-sm mb-2 text-gray-500"
          >
            Caption text using Open Sans Condensed Regular - perfect for small,
            space-constrained text.
          </Text>

          {/* Buttons */}
          <Text
            style={[FONT_STYLES.onest.semibold]}
            className="text-base mb-2 text-white bg-uoft_primary_blue px-4 py-2 rounded-lg text-center"
          >
            BUTTON TEXT - Onest SemiBold
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
