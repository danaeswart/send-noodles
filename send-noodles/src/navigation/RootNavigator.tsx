import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SwipeNavigator from "./SwipeNavigator";
import { OnboardingProvider, useOnboarding } from "../onboarding/OnboardingContext";
import OnboardingOverlay from "../onboarding/OnboardingOverlay";
import SnapReviewScreen from "../screens/SnapReviewScreen";
import CircleDetailScreen from "../screens/CircleDetailScreen";
import PersonalCircleScreen from "../screens/PersonalCircleScreen";
import ChallengeSetupScreen from "../screens/ChallengeSetupScreen";
import MembersScreen from "../screens/MembersScreen";
import MemoriesScreen from "../screens/MemoriesScreen";
import MemoryDetailScreen from "../screens/MemoryDetailScreen";
import ChooseFrameScreen from "../screens/ChooseFrameScreen";
import CircleSnapsScreen from "../screens/CircleSnapsScreen";
import CircleSnapDetailScreen from "../screens/CircleSnapDetailScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import { RootStackParamList } from "./types";
import { useAuthUser } from "../hooks/useAuthUser";
import { useFrameUnlockQueue } from "../hooks/useFrameUnlockQueue";
import FrameRewardModal from "../components/frames/FrameRewardModal";
import { frameRewardForId, FRAME_REWARDS } from "../constants/frames";
import { colors } from "../constants/theme";
import type { FrameUnlock } from "../../firebase/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuthUser();
  const { current: newlyUnlockedFrame, dismissTop } = useFrameUnlockQueue(user?.uid ?? null);
  const newlyUnlockedReward = newlyUnlockedFrame ? frameRewardForId(newlyUnlockedFrame.frameId) : null;

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.paper }} />;
  }

  return (
    <OnboardingProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="Main" component={SwipeNavigator} />
              <Stack.Screen
                name="SnapReview"
                component={SnapReviewScreen}
                options={{ presentation: "modal" }}
              />
              <Stack.Screen name="CircleDetail" component={CircleDetailScreen} />
              <Stack.Screen name="PersonalCircle" component={PersonalCircleScreen} />
              <Stack.Screen name="ChallengeSetup" component={ChallengeSetupScreen} />
              <Stack.Screen name="Members" component={MembersScreen} />
              <Stack.Screen name="Memories" component={MemoriesScreen} />
              <Stack.Screen name="MemoryDetail" component={MemoryDetailScreen} />
              <Stack.Screen name="ChooseFrame" component={ChooseFrameScreen} />
              <Stack.Screen name="CircleSnaps" component={CircleSnapsScreen} />
              <Stack.Screen name="CircleSnapDetail" component={CircleSnapDetailScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </Stack.Navigator>

        <OnboardingOverlay />
      </NavigationContainer>

      <RealFrameRewardGate frame={newlyUnlockedFrame} reward={newlyUnlockedReward} onDismiss={dismissTop} />
    </OnboardingProvider>
  );
}

// The real "you unlocked a frame for real" celebration (see
// useFrameUnlockQueue) is suppressed while the guided tour is showing,
// so a user never sees a frame-unlock modal fighting with the tour.
function RealFrameRewardGate({
  frame,
  reward,
  onDismiss,
}: {
  frame: FrameUnlock | null;
  reward: (typeof FRAME_REWARDS)[keyof typeof FRAME_REWARDS] | null | undefined;
  onDismiss: () => void;
}) {
  const onboarding = useOnboarding();
  if (!frame || !reward || onboarding.active) return null;

  return (
    <FrameRewardModal
      visible
      onDismiss={onDismiss}
      frameSource={reward.source}
      heading="New frame unlocked!"
      message={frame.reason}
      footerNote="Go to the Gallery Wall to view this frame."
    />
  );
}
