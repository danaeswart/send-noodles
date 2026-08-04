import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SwipeNavigator from "./SwipeNavigator";
import SnapReviewScreen from "../screens/SnapReviewScreen";
import CircleDetailScreen from "../screens/CircleDetailScreen";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

// "Main" is the 5-panel swipe deck. SnapReviewScreen and
// CircleDetailScreen push on top of it — modal-style tasks (review a
// just-captured photo, drill into one circle's history) rather than
// part of the horizontal deck itself.
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
