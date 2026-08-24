import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { colors, spacing, type } from "../../constants/theme";
import { RootStackParamList } from "../../navigation/types";
import FloatingIllustration from "../../components/auth/FloatingIllustration";
import AuthTextField from "../../components/auth/AuthTextField";
import AuthButton from "../../components/auth/AuthButton";
import { logInWithEmail } from "../../../firebase/auth";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogIn = async () => {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await logInWithEmail(email.trim(), password);
      // No manual navigation here — RootNavigator swaps to the signed-in
      // screen group on its own once useAuthUser picks up the new
      // session (see RootNavigator.tsx).
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't log you in. Check your details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <FloatingIllustration
        size={150}
        delay={0}
        duration={2600}
        style={{ position: "absolute", top: insets.top + spacing.xl, left: -30 }}
      />
      <FloatingIllustration
        size={110}
        delay={400}
        duration={2200}
        style={{ position: "absolute", top: insets.top + 150, right: -20 }}
      />
      <FloatingIllustration
        size={95}
        delay={800}
        duration={3000}
        style={{ position: "absolute", bottom: insets.bottom + 150, left: 10 }}
      />
      <FloatingIllustration
        size={125}
        delay={200}
        duration={2800}
        style={{ position: "absolute", bottom: insets.bottom + 40, right: 10 }}
      />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.eyebrow}>send noodles</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to see what your circles are up to.</Text>

          <AuthTextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="jess@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            autoComplete="email"
          />
          <AuthTextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            textContentType="password"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <AuthButton label={isSubmitting ? "Logging in…" : "Log In"} onPress={handleLogIn} />

          <Pressable style={styles.switchRow} onPress={() => navigation.navigate("SignUp")} hitSlop={8}>
            <Text style={styles.switchText}>
              New here? <Text style={styles.switchAccent}>Create an account</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, overflow: "hidden" },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1, justifyContent: "center" },
  eyebrow: { ...type.eyebrow, color: colors.muted },
  title: { ...type.serifDisplay, fontSize: 38, color: colors.ink, marginTop: spacing.xs },
  subtitle: { ...type.body, color: colors.muted, marginTop: spacing.sm },
  switchRow: { marginTop: spacing.xl, alignItems: "center" },
  switchText: { ...type.body, color: colors.muted },
  switchAccent: { color: colors.accent, fontWeight: "700" },
  errorText: { ...type.caption, color: colors.alert, marginTop: spacing.md },
});
