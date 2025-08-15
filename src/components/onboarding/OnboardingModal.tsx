import React, { useState, useRef, useEffect } from "react";
import { Modal, View, Dimensions } from "react-native";
import { useAuth } from "@/context/authContext";
import {
  setSecureToken,
  FIRST_SIGN_SIGN_IN,
} from "@/utils/tokens/secureStorage";
import { OnboardingScreen } from "./OnboardingScreen";
import { onboardingSteps } from "./onboardingData";
import ConfettiCannon from "react-native-confetti-cannon";

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const { updateFirstSignInStatus } = useAuth();
  const confettiRef = useRef<any>(null);
  const { width, height } = Dimensions.get("window");

  const handleComplete = async () => {
    await setSecureToken(FIRST_SIGN_SIGN_IN, "false");
    updateFirstSignInStatus(false);
    onComplete();
  };

  const handleNext = () => {
    if (currentIndex < onboardingSteps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const currentStep = onboardingSteps[currentIndex];
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        setShowConfetti(true);
      }, 100);
    } else {
      // Reset confetti when modal closes
      setShowConfetti(false);
      setCurrentIndex(0); // Reset to first step when reopening
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <View style={{ flex: 1 }}>
        <OnboardingScreen
          step={currentStep}
          currentIndex={currentIndex}
          totalSteps={onboardingSteps.length}
          onNext={handleNext}
          onSkip={handleSkip}
          isLast={currentIndex === onboardingSteps.length - 1}
        />

        {/* Confetti Effect - Shows when modal opens */}
        {showConfetti && (
          <>
            <ConfettiCannon
              count={200}
              origin={{ x: width / 2, y: 0 }}
              autoStart={true}
              ref={confettiRef}
              fadeOut={true}
              explosionSpeed={350}
              fallSpeed={3000}
              onAnimationEnd={() => {
                // Auto-hide confetti after animation
                setTimeout(() => setShowConfetti(false), 1000);
              }}
            />
            <ConfettiCannon
              count={120}
              origin={{ x: -10, y: height / 4 }}
              autoStart={true}
              fadeOut={true}
              explosionSpeed={300}
              fallSpeed={2500}
            />
            <ConfettiCannon
              count={120}
              origin={{ x: width + 10, y: height / 4 }}
              autoStart={true}
              fadeOut={true}
              explosionSpeed={300}
              fallSpeed={2500}
            />
          </>
        )}
      </View>
    </Modal>
  );
};
