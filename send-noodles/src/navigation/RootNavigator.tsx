import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SwipeNavigator from "./SwipeNavigator";
import SnapReviewScreen from "../screens/SnapReviewScreen";
import CircleDetailScreen from "../screens/CircleDetailScreen";
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
// initialRouteName is decided by the persisted Firebase auth session:
// a returning signed-in user lands straight on Main instead of Login.
// Rendering the navigator is held until that session finishes
// restoring from AsyncStorage, so a signed-in user never flashes the
// login screen first.
export default function RootNavigator() {
  const { user, loading } = useAuthUser();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.paper }} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "Main" : "Login"} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
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
