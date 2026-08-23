import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { colors, spacing, type } from "../../constants/theme";
import { RootStackParamList } from "../../navigation/types";
import FloatingIllustration from "../../components/auth/FloatingIllustration";
import AuthTextField from "../../components/auth/AuthTextField";
import AuthButton from "../../components/auth/AuthButton";
import { signUpWithEmail } from "../../../firebase/auth";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

export default function SignUpScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAccount = async () => {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await signUpWithEmail(email.trim(), password, firstName.trim(), surname.trim());
      // No manual navigation here — RootNavigator swaps to the signed-in
      // screen group on its own once useAuthUser picks up the new
      // session (see RootNavigator.tsx).
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create your account. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <FloatingIllustration
        color="#2F5233"
        size={90}
        delay={100}
        duration={2500}
        style={{ position: "absolute", top: insets.top + spacing.lg, right: -25 }}
      />
      <FloatingIllustration
        color={colors.accent}
        size={70}
        delay={500}
        duration={2100}
        style={{ position: "absolute", top: insets.top + 210, left: -15 }}
      />
      <FloatingIllustration
        color="#D9A62E"
        size={100}
        delay={0}
        duration={2900}
        style={{ position: "absolute", bottom: insets.bottom + 170, right: -10 }}
      />
      <FloatingIllustration
        color={colors.alert}
        size={65}
        delay={650}
        duration={2400}
        style={{ position: "absolute", bottom: insets.bottom + 30, left: 20 }}
      />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.eyebrow}>send noodles</Text>
          <Text style={styles.title}>Join the circle</Text>
          <Text style={styles.subtitle}>A few details and you're in.</Text>

          <View style={styles.row}>
            <AuthTextField
              label="Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Jess"
              autoCapitalize="words"
              textContentType="givenName"
              style={styles.half}
            />
            <AuthTextField
              label="Surname"
              value={surname}
              onChangeText={setSurname}
              placeholder="Naidoo"
              autoCapitalize="words"
              textContentType="familyName"
              style={styles.half}
            />
          </View>

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
            label="Phone Number"
            value={number}
            onChangeText={setNumber}
            placeholder="082 123 4567"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
          />
          <AuthTextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            textContentType="newPassword"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <AuthButton
            label={isSubmitting ? "Creating…" : "Create Account"}
            onPress={handleCreateAccount}
          />

          <Pressable style={styles.switchRow} onPress={() => navigation.navigate("Login")} hitSlop={8}>
            <Text style={styles.switchText}>
              Already have an account? <Text style={styles.switchAccent}>Log in</Text>
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
  row: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1 },
  switchRow: { marginTop: spacing.xl, alignItems: "center" },
  switchText: { ...type.body, color: colors.muted },
  switchAccent: { color: colors.accent, fontWeight: "700" },
  errorText: { ...type.caption, color: colors.alert, marginTop: spacing.md },
});
