import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SwipeNavigator from "./SwipeNavigator";
import SnapReviewScreen from "../screens/SnapReviewScreen";
import CircleDetailScreen from "../screens/CircleDetailScreen";
import ChallengeSetupScreen from "../screens/ChallengeSetupScreen";
import MembersScreen from "../screens/MembersScreen";
import MemoriesScreen from "../screens/MemoriesScreen";
import MemoryDetailScreen from "../screens/MemoryDetailScreen";
import ChooseFrameScreen from "../screens/ChooseFrameScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import { RootStackParamList } from "./types";
import { useAuthUser } from "../hooks/useAuthUser";
import { colors } from "../constants/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

// Login/SignUp are the entry point ahead of "Main", the 5-panel swipe
// deck. SnapReviewScreen and CircleDetailScreen push on top of Main —
// modal-style tasks (review a just-captured photo, drill into one
// circle's history) rather than part of the horizontal deck itself.
//
// Rendering the navigator is held until the persisted Firebase auth
// session finishes restoring from AsyncStorage, so a signed-in user
// never flashes the login screen first.
//
// The signed-in and signed-out screens are two separate <Stack.Screen>
// groups switched on `user`, rather than a single stack with a fixed
// initialRouteName — initialRouteName only picks the starting route on
// first mount, so it wouldn't react to a later sign-out (or sign-in)
// and navigate the user anywhere.
export default function RootNavigator() {
  const { user, loading } = useAuthUser();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.paper }} />;
  }

  return (
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
            <Stack.Screen name="ChallengeSetup" component={ChallengeSetupScreen} />
            <Stack.Screen name="Members" component={MembersScreen} />
            <Stack.Screen name="Memories" component={MemoriesScreen} />
            <Stack.Screen name="MemoryDetail" component={MemoryDetailScreen} />
            <Stack.Screen name="ChooseFrame" component={ChooseFrameScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
