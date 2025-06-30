import { CheckCircle, Trash, WarningCircle } from "phosphor-react-native";
import { Text, View } from "react-native";
import { BaseToastProps } from "react-native-toast-message";

interface CustomToastProps extends BaseToastProps {
  text1?: string;
  text2?: string;
}

const toastConfig = {
  error: ({ text1, text2 }: CustomToastProps) => (
    <View className="flex-row items-stretch justify-start w-[90%] min-h-[52px] border border-[#D92D20] bg-[#FEF3F2] p-3 rounded-lg mt-6">
      <View className="justify-center mr-2">
        <WarningCircle size={20} color="#D92D20" weight="regular" />
      </View>
      <View className="flex-1">
        {text1 && (
          <Text className="text-[#D92D20] text-[12px] font-opensans-bold flex-wrap">
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
    <View className="flex-row items-stretch justify-start w-[90%] min-h-[52px] border border-[#ABEFC6] bg-[#ECFDF3] p-3 rounded-lg mt-6">
      <View className="justify-center mr-2">
        <CheckCircle size={20} color="#067647" weight="regular" />
      </View>
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
    <View className="flex-row items-stretch justify-start w-[90%] min-h-[52px] border border-[#D92D20] bg-[#FEF3F2] p-3 rounded-lg mt-6">
      <View className="justify-center mr-2">
        <Trash size={20} color="#D92D20" weight="regular" />
      </View>
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
