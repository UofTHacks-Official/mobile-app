import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";

const AdminDashboard = () => {
  const [isScanning, setIsScanning] = useState(false);

  const handleQRScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement QR scanning functionality
    setIsScanning(true);
  };

  const handleSchedule = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/admin/schedule");
  };

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 px-6 text-uoft_black">
        <View className="mt-6">
          <Text className="text-3xl font-['PPObjectSans-Heavy'] mb-2">
            Admin Dashboard
          </Text>
          <Text className="text-lg font-pp text-uoft_black">
            Manage your events and volunteers
          </Text>
        </View>

        <View className="mt-12 space-y-6">
          <Pressable
            className="bg-uoft_secondary_orange p-6 rounded-lg flex-row items-center mb-6"
            onPress={handleQRScan}
            android_ripple={null}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={32}
              color="white"
              style={{ marginRight: 16 }}
            />
            <View>
              <Text className="text-uoft_white text-xl font-['PPObjectSans-Bold']">
                Scan QR Code
              </Text>
              <Text className="text-uoft_white/80 font-pp">
                Scan volunteer QR codes
              </Text>
            </View>
          </Pressable>

          <Pressable
            className="bg-uoft_black p-6 rounded-lg flex-row items-center"
            onPress={handleSchedule}
            android_ripple={null}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <MaterialCommunityIcons
              name="calendar-clock"
              size={32}
              color="white"
              style={{ marginRight: 16 }}
            />
            <View>
              <Text className="text-uoft_white text-xl font-['PPObjectSans-Bold']">
                Schedule
              </Text>
              <Text className="text-uoft_white/80 font-pp">
                Manage event schedules
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AdminDashboard;
