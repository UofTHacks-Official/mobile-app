import { ScrollView, View } from "react-native";
import type { HackerProfile } from "@/requests/hacker";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileEducation } from "./ProfileEducation";
import { ProfileExperience } from "./ProfileExperience";
import { ProfileSkills } from "./ProfileSkills";
import { ProfileInterests } from "./ProfileInterests";
import { ProfileSocials } from "./ProfileSocials";
import { ProfileResume } from "./ProfileResume";

interface ProfileDisplayProps {
  hacker: HackerProfile;
}

export const ProfileDisplay = ({ hacker }: ProfileDisplayProps) => {
  return (
    <ScrollView
      className="flex-1 px-6"
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
    >
      <View className="py-6">
        <ProfileHeader hacker={hacker} />
        <ProfileEducation hacker={hacker} />
        <ProfileExperience hacker={hacker} />
        <ProfileSkills hacker={hacker} />
        <ProfileInterests hacker={hacker} />
        <ProfileSocials hacker={hacker} />
        <ProfileResume hacker={hacker} />
      </View>
    </ScrollView>
  );
};
