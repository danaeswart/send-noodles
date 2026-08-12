import { addDoc, collection } from "firebase/firestore";

import { firestore } from "./firebaseConfig";
import { createPrompt } from "./prompts";
import { pullNextDailyChallenge } from "./challenges";
import type { CircleDoc, PromptDoc } from "./types";

// Dev-only. Firestore collections don't exist until something writes to
// them, so there's nothing to test against on a fresh project. This
// creates a small, real dataset: a couple of prompts, one circle with
// the signed-in user as its only member, and that circle's first
// challenge (pulled the same way the real Lobby flow pulls one) so the
// wager/agreement/scoreboard/snap flow can be exercised end to end.
// Safe to call more than once — each call adds its own fresh circle.
export async function seedDevData(userId: string): Promise<{ circleId: string; challengeId: string }> {
  const dailyPrompt: PromptDoc = {
    promptText: "find something green and snap it",
    type: "daily",
    timeLimitSeconds: null,
    difficulty: "easy",
    tags: ["colour", "outdoors"],
  };
  const timeSensitivePrompt: PromptDoc = {
    promptText: "find something round in 60 seconds",
    type: "time_sensitive",
    timeLimitSeconds: 60,
    difficulty: "medium",
    tags: ["speed"],
  };

  await Promise.all([createPrompt(dailyPrompt), createPrompt(timeSensitivePrompt)]);

  const circle: CircleDoc = {
    name: "Dev Test Circle",
    creatorId: userId,
    members: [userId],
    usedPrompts: [],
    activeChallengeId: null,
  };
  const circleRef = await addDoc(collection(firestore, "circles"), circle);

  const challengeId = await pullNextDailyChallenge(circleRef.id, userId);

  return { circleId: circleRef.id, challengeId };
}
