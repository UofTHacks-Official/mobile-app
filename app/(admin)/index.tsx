import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ScanQrCode } from "lucide-react-native";
import {
  Calendar,
  MoneyWavy,
  TextAUnderline,
  UserCircle,
} from "phosphor-react-native";
import { Pressable, SafeAreaView, Text, View } from "react-native";

const AdminDashboard = () => {
  const handleQRScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(admin)/qr");
  };

  const handleSchedule = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(admin)/schedule");
  };

  const handleHackerBucks = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/hackerbucks");
  };

  const handleFontExample = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/components/FontExample");
  };

  const handleProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(admin)/profile");
  };

  return (
    <SafeAreaView className="flex-1 bg-uoft_white">
      <View className="flex-1 px-6 text-uoft_black">
        <View className="mt-6 flex-row justify-between">
          <View>
            <Text className="text-3xl font-onest-bold mb-2">
              Admin Dashboard
            </Text>
            <Text className="text-lg font-opensans-medium text-uoft_black">
              Manage your events and volunteers
            </Text>
          </View>
          <View>
            <Pressable onPress={handleProfile}>
              <UserCircle size={32} />
            </Pressable>
          </View>
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
            <ScanQrCode size={32} color="white" style={{ marginRight: 16 }} />
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
            <Calendar size={32} color="white" style={{ marginRight: 16 }} />
            <View>
              <Text className="text-uoft_white text-xl font-['PPObjectSans-Bold']">
                Schedule
              </Text>
              <Text className="text-uoft_white/80 font-pp">
                Manage event schedules
              </Text>
            </View>
          </Pressable>

          <Pressable
            className="bg-uoft_accent_purple p-6 rounded-lg flex-row items-center mt-6"
            onPress={handleHackerBucks}
            android_ripple={null}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <MoneyWavy size={32} color="white" style={{ marginRight: 16 }} />
            <View>
              <Text className="text-uoft_white text-xl font-['PPObjectSans-Bold']">
                Hacker Bucks
              </Text>
              <Text className="text-uoft_white/80 font-pp">
                Manage hacker bucks
              </Text>
            </View>
          </Pressable>

          <Pressable
            className="bg-uoft_primary_blue p-6 rounded-lg flex-row items-center mt-6"
            onPress={handleFontExample}
            android_ripple={null}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <TextAUnderline
              size={32}
              color="white"
              style={{ marginRight: 16 }}
            />
            <View>
              <Text className="text-uoft_white text-xl font-['PPObjectSans-Bold']">
                Font Examples
              </Text>
              <Text className="text-uoft_white/80 font-pp">
                View available fonts
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AdminDashboard;
