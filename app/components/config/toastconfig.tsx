import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { BaseToastProps } from "react-native-toast-message";

interface CustomToastProps extends BaseToastProps {
  text1?: string;
  text2?: string;
}

const toastConfig = {
  error: ({ text1, text2 }: CustomToastProps) => (
    <View className="flex-row items-start justify-start w-[90%] min-h-[52px] border border-[#D92D20] bg-[#FEF3F2] p-3 rounded-lg mt-6">
      <MaterialIcons
        name="error-outline"
        size={20}
        color="#D92D20"
        style={{ marginRight: 8, marginTop: 2 }}
      />
      <View className="flex-1">
        {text1 && (
          <Text className="text-[#D92D20] text-[12px] font-opensans-semibold flex-wrap">
            {text1}
          </Text>
        )}
        {text2 && (
          <Text className="text-[#D92D20] text-[12px] mt-1 font-opensans flex-wrap">
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
  success: ({ text1, text2 }: CustomToastProps) => (
    <View className="flex-row items-start justify-start w-[90%] min-h-[52px] border border-[#ABEFC6] bg-[#ECFDF3] p-3 rounded-lg mt-6">
      <MaterialIcons
        name="check-circle-outline"
        size={20}
        color="#067647"
        style={{ marginRight: 8, marginTop: 2 }}
      />
      <View className="flex-1">
        {text1 && (
          <Text className="text-[#067647] text-[12px] font-opensans-semibold flex-wrap">
            {text1}
          </Text>
        )}
        {text2 && (
          <Text className="text-[#067647] text-[12px] mt-1 font-opensans flex-wrap">
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
  delete: ({ text1, text2 }: CustomToastProps) => (
    <View className="flex-row items-start justify-start w-[90%] min-h-[52px] border border-[#D92D20] bg-[#FEF3F2] p-3 rounded-lg mt-6">
      <MaterialIcons
        name="delete-outline"
        size={20}
        color="#D92D20"
        style={{ marginRight: 8, marginTop: 2 }}
      />
      <View className="flex-1">
        {text1 && (
          <Text className="text-[#D92D20] text-[12px] font-opensans-semibold flex-wrap">
            {text1}
          </Text>
        )}
        {text2 && (
          <Text className="text-[#D92D20] text-[12px] mt-1 font-opensans flex-wrap">
            {text2}
          </Text>
        )}
      </View>
    </View>
  ),
};

export default toastConfig;
