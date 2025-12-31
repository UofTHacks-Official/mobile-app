import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { FileText, ExternalLink } from "lucide-react-native";
import { useTheme } from "@/context/themeContext";
import { cn, getThemeStyles } from "@/utils/theme";
import type { HackerProfile } from "@/requests/hacker";
import { useFetchHackerResume } from "@/queries/hacker";
import { useState, useEffect } from "react";

interface ProfileResumeProps {
  hacker: HackerProfile;
}

export const ProfileResume = ({ hacker }: ProfileResumeProps) => {
  const { isDark } = useTheme();
  const themeStyles = getThemeStyles(isDark);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  const applicationId = hacker.application_id ?? hacker.hacker_id;
  const { data: resumeBlob, isLoading: isPending } =
    useFetchHackerResume(applicationId);

  useEffect(() => {
    if (resumeBlob) {
      try {
        const url = URL.createObjectURL(resumeBlob);
        setPdfUri(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.warn("Failed to create resume URL:", error);
        setPdfUri(null);
      }
    }
  }, [resumeBlob]);

  const handleViewResume = () => {
    if (pdfUri) {
      window.open(pdfUri, "_blank");
    }
  };

  return (
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
          disabled={isPending || !pdfUri}
          className={cn(
            "flex-row items-center justify-center py-3 px-4 rounded-lg",
            isDark ? "bg-[#75EDEF]" : "bg-[#132B38]",
            (isPending || !pdfUri) && "opacity-50"
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
          ) : !pdfUri ? (
            <>
              <FileText
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
                No Resume Available
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
  );
};
