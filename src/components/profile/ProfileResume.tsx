import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { FileText, ExternalLink, X } from "lucide-react-native";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import type { HackerProfile } from "@/requests/hacker";
import { useFetchHackerResume } from "@/queries/hacker";
import { useState } from "react";

// Conditionally import PDF viewer only for native platforms
const Pdf = Platform.OS !== "web" ? require("react-native-pdf").default : null;

interface ProfileResumeProps {
  hacker: HackerProfile;
}

export const ProfileResume = ({ hacker }: ProfileResumeProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [showModal, setShowModal] = useState(false);
  const [pdfUri, setPdfUri] = useState<string>("");

  const applicationId = hacker.application_id ?? hacker.hacker_id;
  const { mutateAsync: fetchResume, isPending } = useFetchHackerResume();

  const handleViewResume = async () => {
    try {
      // Fetch the resume blob with authentication
      const blob = await fetchResume(applicationId);

      // Convert blob to base64 data URI
      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = () => {
        const base64data = reader.result as string;
        setPdfUri(base64data);
        setShowModal(true);
      };

      reader.onerror = () => {
        Alert.alert("Error", "Failed to process resume file");
      };
    } catch (error) {
      console.error("Error viewing resume:", error);
      Alert.alert("Error", "Failed to load resume. Please try again.");
    }
  };

  return (
    <>
      <View className="mt-6">
        <Text
          className={cn("text-lg font-semibold mb-3", themeStyles.primaryText)}
        >
          Resume
        </Text>
        <View
          className={cn(
            "p-4 rounded-xl",
            isDark ? "bg-neutral-800" : "bg-neutral-100"
          )}
        >
          <View className="flex-row items-center mb-3">
            <FileText
              size={20}
              color={isDark ? "#75EDEF" : "#132B38"}
              className="mr-2"
            />
            <Text
              className={cn(
                "text-base font-medium flex-1",
                themeStyles.primaryText
              )}
            >
              {hacker.hacker_fname} {hacker.hacker_lname}&apos;s Resume
            </Text>
          </View>

          <Pressable
            onPress={handleViewResume}
            disabled={isPending}
            className={cn(
              "flex-row items-center justify-center py-3 px-4 rounded-lg",
              isDark ? "bg-[#75EDEF]" : "bg-[#132B38]",
              isPending && "opacity-50"
            )}
          >
            {isPending ? (
              <>
                <ActivityIndicator
                  size="small"
                  color={isDark ? "#000" : "#fff"}
                  className="mr-2"
                />
                <Text
                  className={cn(
                    "font-semibold text-base",
                    isDark ? "text-black" : "text-white"
                  )}
                >
                  Loading...
                </Text>
              </>
            ) : (
              <>
                <ExternalLink
                  size={18}
                  color={isDark ? "#000" : "#fff"}
                  className="mr-2"
                />
                <Text
                  className={cn(
                    "font-semibold text-base",
                    isDark ? "text-black" : "text-white"
                  )}
                >
                  View Resume
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* PDF Viewer Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className={cn("flex-1", themeStyles.background)}>
          {/* Header */}
          <View
            className={cn(
              "flex-row items-center justify-between p-4 border-b",
              isDark ? "border-neutral-800" : "border-neutral-200"
            )}
          >
            <Text
              className={cn("text-lg font-semibold", themeStyles.primaryText)}
            >
              {hacker.hacker_fname} {hacker.hacker_lname}&apos;s Resume
            </Text>
            <Pressable onPress={() => setShowModal(false)}>
              <X size={24} color={isDark ? "#75EDEF" : "#132B38"} />
            </Pressable>
          </View>

          {/* PDF Viewer */}
          {Platform.OS === "web" ? (
            <iframe
              src={pdfUri}
              style={{
                flex: 1,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              title="Resume PDF"
            />
          ) : Pdf ? (
            <Pdf
              source={{ uri: pdfUri }}
              style={{ flex: 1 }}
              trustAllCerts={false}
              onLoadComplete={(numberOfPages: number) => {
                console.log(`PDF loaded with ${numberOfPages} pages`);
              }}
              onError={(error: Error) => {
                console.error("PDF Error:", error);
                Alert.alert("Error", "Failed to load PDF");
              }}
            />
          ) : null}
        </View>
      </Modal>
    </>
  );
};
