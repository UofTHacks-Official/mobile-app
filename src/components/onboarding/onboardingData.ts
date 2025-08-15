export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  buttonText?: string;
}

export const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to UofT Hacks!",
    description:
      "Your all-in-one companion for the hackathon. Let's show you around the key features that'll make your experience amazing.",
    icon: "🎉",
    buttonText: "Let's Go!!",
  },
  {
    id: 2,
    title: "Stay Updated with Schedule",
    description:
      "Never miss an event! Check out workshops, meals, and activities all in one place. Get notified about what's coming up next.",
    icon: "📅",
    buttonText: "Next",
  },
  {
    id: 3,
    title: "Earn & Spend HackerBucks",
    description:
      "Complete challenges, attend events, and earn HackerBucks! Use them to get awesome swag and prizes throughout the event.",
    icon: "💰",
    buttonText: "Next",
  },
  {
    id: 4,
    title: "QR Scanner & Profile",
    description:
      "Use the built-in QR scanner to check into events and claim rewards. Manage your profile and track your hackathon journey.",
    icon: "📱",
    buttonText: "Let's Go!",
  },
];
