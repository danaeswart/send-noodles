import { useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import AuthButton from "../auth/AuthButton";
import AuthTextField from "../auth/AuthTextField";
import { colors, spacing, type } from "../../constants/theme";
import { createCircle, joinCircleByCode } from "../../../firebase/circles";

type Tab = "create" | "join";

type Props = {
  userId: string | null;
  // Measured by CirclesScreen from its container's actual onLayout and
  // passed down, rather than each page computing its own
  // Dimensions.get("window") value — the two could drift apart from the
  // FlatList's real rendered height once nested inside the horizontal
  // PagerView deck, which broke paging to this (last) page.
  pageHeight: number;
  onCircleCreated: (circleId: string) => void;
  onCircleReady: (circleId: string) => void;
};

export default function CreateJoinCirclePanel({ userId, pageHeight, onCircleCreated, onCircleReady }: Props) {
  const [tab, setTab] = useState<Tab>("create");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<{ circleId: string; joinCode: string } | null>(null);

  const handleCreate = async () => {
    if (isSubmitting || !userId) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await createCircle(name, userId);
      setCreatedCode(result);
      onCircleCreated(result.circleId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create that circle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async () => {
    if (isSubmitting || !userId) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const circleId = await joinCircleByCode(code, userId);
      onCircleReady(circleId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't join that circle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (!createdCode) return;
    void Share.share({ message: createdCode.joinCode });
  };

  if (createdCode) {
    return (
      <View style={[styles.page, { height: pageHeight }]}>
        <View style={styles.topPanel}>
          <Text style={styles.eyebrow}>CIRCLE CREATED</Text>
          <Text style={[styles.title, styles.titleSuccess]}>circle {name.trim()} has been created</Text>
        </View>
        <View style={styles.contentPanel}>
          <Text style={styles.explainer}>
            Share this code with your friends so they can join — anyone with it can hop in instantly.
          </Text>
          <Text style={styles.codeDisplay}>{createdCode.joinCode}</Text>
          <AuthButton label="share code" onPress={handleShare} />
          <Text style={styles.noteText}>
            This code doesn't expire — you can come back and share it again anytime from inside the circle. You're
            the admin now, so you can add or remove friends whenever you like.
          </Text>
          <AuthButton
            label="view circle →"
            onPress={() => onCircleReady(createdCode.circleId)}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.page, { height: pageHeight }]}>
      <View style={styles.topPanel}>
        <Text style={styles.eyebrow}>CIRCLES</Text>
        <Text style={styles.title}>start or join a circle</Text>
      </View>

      <View style={styles.contentPanel}>
        <View style={styles.tabRow}>
          <Pressable onPress={() => setTab("create")} style={styles.tabButton}>
            <Text style={[styles.tabLabel, tab === "create" && styles.tabLabelActive]}>create</Text>
            {tab === "create" && <View style={styles.tabUnderline} />}
          </Pressable>
          <Pressable onPress={() => setTab("join")} style={styles.tabButton}>
            <Text style={[styles.tabLabel, tab === "join" && styles.tabLabelActive]}>join</Text>
            {tab === "join" && <View style={styles.tabUnderline} />}
          </Pressable>
        </View>

        {tab === "create" ? (
          <>
            <Text style={styles.explainer}>
              Every circle runs on a code. Create one, then send it to your friends however you like.
            </Text>
            <AuthTextField label="circle name" value={name} onChangeText={setName} placeholder="the flatmates" />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <AuthButton label={isSubmitting ? "creating…" : "create circle"} onPress={handleCreate} />
          </>
        ) : (
          <>
            <Text style={styles.explainer}>Got a code from a friend? Enter it below to join their circle.</Text>
            <AuthTextField
              label="circle code"
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              placeholder="ABC123"
              autoCapitalize="characters"
              maxLength={6}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <AuthButton label={isSubmitting ? "joining…" : "join circle"} onPress={handleJoin} />
          </>
        )}

        <Text style={styles.bottomHint}>swipe down to see your circles</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: "100%", backgroundColor: colors.paper },
  topPanel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.accent,
  },
  eyebrow: { ...type.eyebrow, color: colors.paper, letterSpacing: 2 },
  title: {
    ...type.display,
    color: colors.paper,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    marginTop: spacing.sm,
  },
  titleSuccess: { fontSize: 26, lineHeight: 30 },
  contentPanel: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  tabRow: { flexDirection: "row", gap: spacing.xl },
  tabButton: { paddingBottom: spacing.sm },
  tabLabel: { ...type.eyebrow, color: colors.muted, letterSpacing: 2 },
  tabLabelActive: { color: colors.ink },
  tabUnderline: { height: 2, backgroundColor: colors.accent, marginTop: spacing.xs },
  explainer: { ...type.body, color: colors.muted, marginTop: spacing.lg, marginBottom: spacing.sm },
  errorText: { ...type.caption, color: colors.alert, marginTop: spacing.sm },
  noteText: { ...type.caption, color: colors.muted, lineHeight: 18, marginTop: spacing.lg },
  bottomHint: {
    ...type.caption,
    color: colors.muted,
    textAlign: "center",
    letterSpacing: 1,
    marginTop: spacing.xl,
  },
  codeDisplay: {
    ...type.display,
    color: colors.accent,
    fontSize: 48,
    letterSpacing: 6,
    textAlign: "center",
    marginVertical: spacing.xl,
  },
  secondaryButton: { backgroundColor: colors.paperDim },
  secondaryButtonText: { color: colors.ink },
});
