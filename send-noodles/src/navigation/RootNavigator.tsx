import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SwipeNavigator from "./SwipeNavigator";
import SnapReviewScreen from "../screens/SnapReviewScreen";
import CircleDetailScreen from "../screens/CircleDetailScreen";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

// "Main" is the 3-panel swipe hub (Lobby / Gallery / Profile).
// SnapReview and CircleDetail push on top of it — these are the moments
// the app deliberately breaks from pure horizontal swipe, because they're
// modal-style tasks (review a photo, drill into one circle) rather than
// part of the hub itself.
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={SwipeNavigator} />
        <Stack.Screen
          name="SnapReview"
          component={SnapReviewScreen}
          options={{ presentation: "modal" }}
        />
        <Stack.Screen name="CircleDetail" component={CircleDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
